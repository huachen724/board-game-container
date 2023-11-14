const socket = io("ws://localhost:3000");

let clientId;
const playerNames = {};
const playerArr = [];
const submitButton = document.getElementById("submitButton");
const playerNameInput = document.getElementById("playerName");
const startGameButton = document.getElementById("startGameButton");
const revealOtherRoles = document.getElementById("revealOtherRoles");

socket.on("clientid", (id) => {
  // initialState.players. = id;
  console.log("Client id: " + id);
  clientId = id;
  console.log("right before button");

  submitButton.addEventListener("click", (e) => {
    console.log("clicked submit button");
    submitButton.style.color = "yellow";
    const playerName = playerNameInput.value;
    console.log(playerName);
    socket.emit("submitName", {
      clientId: clientId,
      playerName: playerName,
    });
    console.log("after emitting submitname");
  });
});

socket.on("fivePlayersJoined", () => {
  console.log("Hello");
  startGameButton.style.display = "block";
  // Add a click event listener to the "Start Game" button
  document
    .getElementById("startGameButton")
    .addEventListener("click", function () {
      socket.emit("start");
    });
});

socket.on("assignRoles", (assignedRoles) => {
  startGameButton.style.display = "none";
  console.log(clientId);
  console.log(assignedRoles);
  let YourRole = "";
  for (const role in assignedRoles) {
    if (assignedRoles[role].Client_id == clientId) {
      console.log("You are " + role);
      YourRole = role;
    }
  }

  document.getElementById("current-turn").classList.remove("hide");
  // Get elements with the class "clientId"
  var clientIdElements = document.getElementsByClassName("clientId");

  // Update each element with the class "clientId"
  for (var i = 0; i < clientIdElements.length; i++) {
    clientIdElements[i].innerHTML = YourRole;
  }
});

socket.on("otherRoles", (otherRoles) => {
  console.log(otherRoles);
  revealOtherRoles.style.display = "block";
  revealOtherRoles.addEventListener("click", function () {
    displayRoles(otherRoles);
    socket.emit("saw-other-roles");
    revealOtherRoles.style.display = "none";
  });
});

socket.on("go-to-mid-state", () => {
  document.getElementById("mid-state-button").style.display = "block";
  document
    .getElementById("mid-state-button")
    .addEventListener("click", function () {
      socket.emit("mid-state-start");
      document.getElementById("mid-state-button").style.display = "none";
      // document.getElementById("inital-state").classList.add("hide");
      // document.getElementById("mid-state").classList.remove("hide");
    });
});

// get the active player and get field state
socket.on("mid-state", (e) => {
  document.getElementById("inital-state").classList.add("hide");

  document.getElementById("mid-state").classList.remove("hide");
  console.log(e);
});

// restart the game
function restart() {
  window.location.reload();
}

function displayRoles(playerRoles) {
  var roleMsgElements = document.getElementsByClassName("role-message");

  // Display each role
  console.log(playerRoles);
  playerRoles.forEach(function (playerRole) {
    for (const role in playerRoles) {
      if (clientId == playerRoles[role].clientId) {
        console.log("Hello");
        if (playerRoles[role].are !== undefined) {
          // Update each element with the class "role-message"
          for (var i = 0; i < roleMsgElements.length; i++) {
            roleMsgElements[i].innerHTML =
              playerRoles[role].are + ": " + playerRoles[role].knows;
          }
        } else {
          // Update each element with the class "role-message"
          for (var i = 0; i < roleMsgElements.length; i++) {
            roleMsgElements[i].innerHTML =
              "Your role does not know special information!";
          }
        }
      }
    }
  });

  // Show
  document.getElementById("show-other-roles").classList.remove("hide");
}
