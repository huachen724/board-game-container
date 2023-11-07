const socket = io("ws://localhost:3000");

let clientId;
const playerNames = {};
const playerArr = [];
const submitButton = document.getElementById("submitButton");
const playerNameInput = document.getElementById("playerName");
const startGameButton = document.getElementById("startGameButton");
socket.on("clientid", (id) => {
  clientId = id;
  console.log(clientId);
  console.log("HELLO");
});
submitButton.addEventListener("click", () => {
  submitButton.style.color = "yellow";
  const playerName = playerNameInput.value;
  socket.emit("addToMap", [[clientId], [playerName]]);
});
socket.on("enoughPlayers", () => {
  console.log("Hello");
  startGameButton.style.display = "block";
  // Add a click event listener to the "Start Game" button
  document
    .getElementById("startGameButton")
    .addEventListener("click", function () {
      socket.emit("start");
    });
});
socket.on("hua", () => {
  console.log("Hi hua");
});

// get the first active player id and set up html for game
startGameButton.addEventListener("click", () => {
  // Handle the game start logic here
  // You can emit an event to the server to signal the start of the game

  socket.on("start2", (assignedRoles) => {
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
});

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
