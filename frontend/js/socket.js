const socket = io("ws://localhost:3000");

let clientId;
const playerNames = {};
const playerArr = [];
const submitButton = document.getElementById("submitButton");
const playerNameInput = document.getElementById("playerName");
const startGameButton = document.getElementById("startGameButton");
const revealOtherRoles = document.getElementById("revealOtherRoles");

// const initialState = {
//   players: {
//     // "Alpha1": false,
//     // "Beta1": false,
//     // "Gamma1": false
//   }, // The current players in the game
//   username: "temp", // The user's name
//   userRole: "temp", // The user's assigned role
//   userRoleDescription: "temp", // description of user's role
//   gamePhase: "Intro", // Current state of the game, determines what view to show
//   centerCards: {
//     // Center cards during the game
//     Alpha: false,
//     Beta: false,
//     Gamma: false,
//   },
//   nightSelectNum: 1, // How many cards that can be selected at once
//   nightSelectPlayer: [], // Player selected for night action
//   majorityNum: 0, // Number to count if everyone is ready
//   majorityReady: false, // Only true when everyone ready to move on
//   allRoles: baseSetRoles, // All the roles that are available to pick from, and which are selected
//   currentRoles: {}, // All of the roles that are in the current game
// };

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
    socket.emit("submitName", [[clientId], [playerName]]);
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

// get the first active player id and set up html for game
// startGameButton.addEventListener("click", (e) => {
// Handle the game start logic here
// You can emit an event to the server to signal the start of the game

socket.on("assignRoles", (assignedRoles) => {
  console.log(clientId);
  console.log(assignedRoles);
  let YourRole = "";
  for (const role in assignedRoles) {
    if (assignedRoles[role].Client_id == clientId) {
      console.log("You are " + role);
      YourRole = role;
    }
  }

  // activeId = startId;

  document.getElementById("current-turn").classList.remove("hide");
  document.getElementById("clientId").innerHTML = YourRole;
});

socket.on("otherRoles", (otherRoles) => {
  document
    .getElementById("revealOtherRoles")
    .addEventListener("click", function () {
      for (const role in otherRoles) {
        console.log(role);
      }
    });
});
// });

// get the active player and get field state
socket.on("continue", (assignedRoles) => {
  // activeId = active;
  // for (let x = 0; x < field.length; x++) {
  //   for (let y = 0; y < field.length; y++) {
  //     setField(x, y, field[y][x]);
  //   }
  // }
  // document.getElementById("current-turn").classList.remove("hide");
  // document.getElementById("clientId").innerHTML =
  //   clientId == activeId ? "your" : "not your";
  // console.log("You are " + assignedRoles[clientId]);
});

// // update field with turn information
// socket.on("turn", (turn) => {
//   const { x, y, next } = turn;
//   setField(x, y, activeId);

//   activeId = next;
//   document.getElementById("clientId").innerHTML =
//     clientId == activeId ? "your" : "not your";
// });

// // show popup with win information
// socket.on("over", (overObj) => {
//   winnerId = overObj["id"];
//   if (winnerId != 0)
//     document.getElementById("winnerId").innerHTML =
//       clientId == winnerId ? "won" : "lost";
//   else document.getElementById("winnerId").innerHTML = "draw";

//   socket.disconnect();

//   document.getElementById("popup").classList.remove("hide");
//   document.getElementById("current-turn").classList.add("hide");
// });

// // send turn event to server
// function turn(x, y) {
//   if (activeId != clientId) return;
//   if (
//     getField(x, y).classList.contains(token[1]) ||
//     getField(x, y).classList.contains(token[2])
//   )
//     return;
//   console.log("send");
//   socket.emit("turn", {
//     x: x,
//     y: y,
//   });
// }

// // get field
// function getField(x, y) {
//   return document.getElementById(`x${x}y${y}`);
// }

// // update css for field
// function setField(x, y, id) {
//   let field = getField(x, y);
//   field.classList.add(`${token[id]}`);
// }

// restart the game
function restart() {
  window.location.reload();
}
