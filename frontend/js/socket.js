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
  console.log("go-to-mid-state handler");
  document.getElementById("mid-state-button").style.display = "block";
  document
    .getElementById("mid-state-button")
    .addEventListener("click", function () {
      socket.emit("mid-state-start", "initial"); // This is where mid-state-start starts
      document.getElementById("mid-state-button").style.display = "none";
    });
});

// get field state
socket.on("mid-state", (e) => {
  console.log("mid-state handler");
  document.getElementById("inital-state").classList.add("hide");
  document.getElementById("mid-state").classList.remove("hide");

  // console.log(e);
});

// Only the specific client_id whose role is chosen is handled here
socket.on("mid-state-captain", (filteredRoles) => {
  console.log("mid-state-captain handler:)");
  createCheckList(filteredRoles);
  let chosenPlayers = "";
  document.getElementById("checkListSubmitButton").classList.remove("hide");
  document
    .getElementById("checkListSubmitButton")
    .addEventListener("click", function () {
      chosenPlayers = handleSubmitCheckList();
      socket.emit("mid-state-vote", chosenPlayers);
      document.getElementById("playerChecklist").classList.add("hide");
      document.getElementById("checkListSubmitButton").classList.add("hide");
    });
  console.log(chosenPlayers);
});

// Everyone but the captain is handled here via broadcast on the server side
socket.on("mid-state-vote-active", (chosenPlayers) => {
  console.log("mid-state-vote-active handler");
  // Attach click event to the "Yes" button
  document.getElementById("selectedPlayers").classList.remove("hide");
  console.log("Chosen players: " + chosenPlayers);
  // var clientIdElements = document.getElementsByClassName("clientId");

  // document.getElementsByClassName("selected-players").innerHTML = chosenPlayers;

  // Get all elements with the class "selected-players"
  const selectedPlayersElements =
    document.getElementsByClassName("selected-players");

  // Iterate through the collection and set the innerHTML for each element
  for (let i = 0; i < selectedPlayersElements.length; i++) {
    selectedPlayersElements[i].innerHTML = chosenPlayers;
  }
  document.getElementById("yesVoteButton").classList.remove("hide");
  document.getElementById("noVoteButton").classList.remove("hide");
  document
    .getElementById("yesVoteButton")
    .addEventListener("click", function () {
      socket.emit("playerVoteChoice", "Yes");
      document.getElementById("yesVoteButton").classList.add("hide");
      document.getElementById("noVoteButton").classList.add("hide");
      document.getElementById("selectedPlayers").classList.add("hide");
    });

  // Attach click event to the "No" button
  document
    .getElementById("noVoteButton")
    .addEventListener("click", function () {
      socket.emit("playerVoteChoice", "No");
      document.getElementById("yesVoteButton").classList.add("hide");
      document.getElementById("noVoteButton").classList.add("hide");
      document.getElementById("selectedPlayers").classList.add("hide");
    });
});

// Selected players go on mission and ONLY they vote (for fail or succeed)
socket.on("vote-succeeded", () => {
  console.log("vote-succeeded handler");
  alert("Vote succeeded. Selected players will now go on the mission..");
});

// private message to selected players to go on mission
socket.on("mission-vote", () => {
  console.log("mission-vote handler");
  alert(
    "You are on currently on the mission, are you succeeding or failing it?"
  );
  // Attach click event to the "Yes" button
  document.getElementById("missionMessage").classList.remove("hide");

  document.getElementById("succeedButton").classList.remove("hide");
  document.getElementById("failButton").classList.remove("hide");
  document
    .getElementById("succeedButton")
    .addEventListener("click", function () {
      socket.emit("playerMissionChoice", "Succeed");
      document.getElementById("succeedButton").classList.add("hide");
      document.getElementById("failButton").classList.add("hide");
      document.getElementById("missionMessage").classList.add("hide");
    });

  // Attach click event to the "No" button
  document.getElementById("failButton").addEventListener("click", function () {
    socket.emit("playerMissionChoice", "Fail");
    document.getElementById("failButton").classList.add("hide");
    document.getElementById("succeedButton").classList.remove("hide");
    document.getElementById("missionMessage").classList.add("hide");
  });
});
// Reset the temp counter
socket.on("vote-failed", () => {
  // NOTE: Remove/Reset all the old info
  console.log("vote-failed handler");
  clearData();
  socket.emit("mid-state-start", "failed");
});

socket.on("midgame-restart", () => {
  console.log("midgame-restart handler");
  console.log("restart mid state");
  clearData();
  socket.emit("mid-state-start", "restart");
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

function createCheckList(rolesData) {
  console.log("X");
  const playerChecklistContainer = document.getElementById("playerChecklist");
  playerChecklistContainer.classList.remove("hide");
  rolesData.forEach((player) => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "player";
    checkbox.value = player.Player_name;

    const label = document.createElement("label");
    label.appendChild(document.createTextNode(player.Player_name));

    playerChecklistContainer.appendChild(checkbox);
    playerChecklistContainer.appendChild(label);
    playerChecklistContainer.appendChild(document.createElement("br"));
  });
}

function handleSubmitCheckList() {
  const checkedPlayers = Array.from(
    document.querySelectorAll('input[name="player"]:checked')
  ).map((checkbox) => checkbox.value);
  console.log("Checked players:", checkedPlayers);

  socket.emit("checkedPlayers", checkedPlayers);

  return checkedPlayers;
}

function clearData() {
  document.getElementById("playerChecklist").innerHTML = "";
  document.getElementById("selectedPlayers").innerHTML = "";
  document.getElementsByClassName("selected-players").innerHTML = "";
}
