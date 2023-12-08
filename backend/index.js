const data = require("./data.json");

// add cors https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
const options = {
  cors: true,
};

const io = require("socket.io")(options);
const clientIdPlayerNamePair = [];

const players = {
  1: "",
  2: "",
  3: "",
  4: "",
  5: "",
};

let currentCaptainIndex = Math.floor(Math.random() * 5); // NOTE: 5 is hardcoded here
let sawOtherRolesCounter = 0;

// MID STATE VARIABLES
let mission_number = 0;
let total_succeeds = 0;
let total_fails = 0;
let captain = "";

let CHOSEN_PLAYERS;

// Vote
let choiceCounter = 0; // reset
let playerVoteChoiceLength = 0; // reset

// Mission
let containsFail_m = false; // reset
let playerVoteChoiceLength_m = 0; // reset

let tempCounter = 0; // reset in temp >5
let tempCounter2 = 0; // reset in temp >5

io.on("connection", (socket) => {
  if (io.sockets.sockets.size > 5) {
    console.log("Something went wrong! Too many players tried to connect!");
    socket.disconnect();
  }

  // join server with socket id
  const sockId = socket.id;

  // Give the client a client ID
  socket.emit("clientid", sockId);

  // pair = [clientID, playerName]
  socket.on("submitName", (pair) => {
    console.log("submitName handler");
    clientIdPlayerNamePair.push(pair);
    console.log(clientIdPlayerNamePair);
    if (clientIdPlayerNamePair.length >= 5) {
      console.log("Inside if statement");
      io.emit("fivePlayersJoined");
    }
  });

  socket.on("start", () => {
    // io.to("room 1").emit("hua");
    console.log("Got to start");
    if (Object.keys(clientIdPlayerNamePair).length >= 5) {
      // console.log("hi");
      started = true;
      values = [];

      // Shuffle clientIds to match with the list of roles
      for (let i = clientIdPlayerNamePair.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [clientIdPlayerNamePair[i], clientIdPlayerNamePair[j]] = [
          clientIdPlayerNamePair[j],
          clientIdPlayerNamePair[i],
        ];
      }

      let counter1 = 0;
      // Set the client id
      for (const role in data.player_roles) {
        const roleData = data.player_roles[role];
        roleData.Client_id = clientIdPlayerNamePair[counter1].clientId;
        roleData.Player_name = clientIdPlayerNamePair[counter1].playerName;
        counter1++;
      }

      playerNameComplete = true;

      io.emit("assignRoles", data.player_roles);

      console.log("Match started");
      console.log("let assigned roles know other roles");

      console.log(data.player_roles);
      console.log(data.player_roles.Morgana.Player_name);
      io.emit("otherRoles", [
        {
          clientId: data.player_roles.Assassin.Client_id,
          knows: [data.player_roles.Morgana.Player_name], // only knows bad guy, not unique role
          are: ["Your allies"],
        },
        {
          clientId: data.player_roles.Merlin.Client_id,
          knows: [
            data.player_roles.Morgana.Player_name,
            data.player_roles.Assassin.Player_name,
          ], // all the bad guys, thats it
          are: "Bad guys",
        },
        {
          clientId: data.player_roles.Percival.Client_id,
          knows: [
            data.player_roles.Merlin.Player_name,
            data.player_roles.Morgana.Player_name,
          ], // only knows bad guy, not unique role
          are: "Bad guys",
        },
        {
          clientId: data.player_roles.Morgana.Client_id,
          knows: [data.player_roles.Assassin.Player_name], // only knows bad guy, not unique role
          are: "Bad guys",
        },
        {
          clientId: data.player_roles.Good_guy.Client_id,
          knows: [],
        },
      ]);
    }
  });

  socket.on("saw-other-roles", () => {
    console.log("saw-other-roles handler");
    console.log("do ig et here?");
    sawOtherRolesCounter++;
    console.log(sawOtherRolesCounter);
    if (sawOtherRolesCounter === 5) {
      io.emit("go-to-mid-state");
      captain = nextTurn();
    }
  });

  socket.on("mid-state-start", (data) => {
    console.log(`Total Succeeds: ${total_succeeds}`);
    console.log(`Data: ${data}`);
    // if (data && data.toUpperCase() === "RESTART") {
    //   tempCounter = 0;
    //   console.log("Resetting tempCounter");
    // }
    tempCounter++;
    console.log(tempCounter);
    console.log("mid-state-start handler");

    // Setting up mid state
    console.log("Got to here");

    // Start a player's turn (randomized initially)
    // let captainClientId = nextTurn();
    let allRoleArr = getAllRoles();
    console.log(`captain: ${captain}`);
    if (tempCounter >= 5) {
      ResetMidStateVars();
      mission_number++;
      tempCounter = 0;
      console.log("Server sending mid-state");
      console.log("Below are all current global variable values: \n ------");
      console.log(`clientIdPlayerNamePair: ${clientIdPlayerNamePair}`);
      console.log(`currentCaptainIndex: ${currentCaptainIndex}`);
      console.log(`sawOtherRolesCounter: ${sawOtherRolesCounter}`);
      console.log(`mission_number: ${mission_number}`);
      console.log(`total_succeeds: ${total_succeeds}`);
      console.log(`total_fails: ${total_fails}`);
      console.log(`CHOSEN_PLAYERS: ${CHOSEN_PLAYERS}`);
      console.log(`choiceCounter: ${choiceCounter}`);
      console.log(`playerVoteChoiceLength: ${playerVoteChoiceLength}`);
      console.log(`containsFail_m: ${containsFail_m}`);
      console.log(`playerVoteChoiceLength_m: ${playerVoteChoiceLength_m}`);
      console.log(`tempCounter: ${tempCounter}`);

      io.emit("mid-state", captain, allRoleArr); // Make ALL clients move to mid-state View
      io.to(captain).emit("mid-state-captain", allRoleArr); // info needed: captain,
    }
  });

  socket.on("mid-state-vote", (chosenPlayers) => {
    console.log("mid-state-vote handler");
    io.emit("mid-state-vote-active", chosenPlayers);
    CHOSEN_PLAYERS = getPlayersClientId(chosenPlayers);
    captain = nextTurn();
    console.log("mid-state-vote");
  });

  // chosenPlayers: the playerName of clients who were voted to go on the mission
  function getPlayersClientId(chosenPlayers) {
    console.log(chosenPlayers);
    const clientIds = [];
    // Iterate through chosenPlayers and find corresponding Client_id
    chosenPlayers.forEach((playerName) => {
      for (const i in clientIdPlayerNamePair) {
        if (clientIdPlayerNamePair[i].playerName === playerName) {
          clientIds.push(clientIdPlayerNamePair[i].clientId);
        }
      }
    });

    return clientIds;
  }

  socket.on("playerVoteChoice", (choice) => {
    console.log("playerVoteChoice handler");
    playerVoteChoiceLength++;
    console.log(`playerVoteChoiceLength: ${playerVoteChoiceLength}`);
    console.log(choice);
    if (choice === "Yes") {
      console.log("hello");
      choiceCounter = choiceCounter + 1;
      console.log("choiceCounter: " + choiceCounter);
    } else {
      choiceCounter -= 1;
    }
    console.log(`choice Counter: ${choiceCounter}`);

    // Vote Succeeded
    switch (mission_number) {
      case 1:
        if (choiceCounter > 0 && playerVoteChoiceLength === 5) {
          console.log("Got to success voting");
          io.emit("vote-succeeded");
          console.log(CHOSEN_PLAYERS);
          CHOSEN_PLAYERS.forEach((socket_id) => {
            console.log(socket_id);
            io.to(socket_id).emit("mission-vote");
          });

          // socket.emit("vote-succeeded"); // FUTURE: can add round # to be incremented indicating next mission
          // Vote Failed
        } else if (choiceCounter <= 0 && playerVoteChoiceLength === 5) {
          // total_fails++
          console.log("Got to failed voting");
          CHOSEN_PLAYERS = "";
          io.emit("vote-failed"); // FUTURE: can add round number to be the same here, indicating repeating the mission with new captain
          // (roundNumber, NewCaptain)
        }
        break;
      case 2:
        if (choiceCounter > 0 && playerVoteChoiceLength === 10) {
          console.log("Got to success voting");
          io.emit("vote-succeeded");
          console.log(CHOSEN_PLAYERS);
          CHOSEN_PLAYERS.forEach((socket_id) => {
            console.log(socket_id);
            io.to(socket_id).emit("mission-vote");
          });

          // socket.emit("vote-succeeded"); // FUTURE: can add round # to be incremented indicating next mission
          // Vote Failed
        } else if (choiceCounter <= 0 && playerVoteChoiceLength === 10) {
          // total_fails++
          console.log("Got to failed voting");
          CHOSEN_PLAYERS = "";
          io.emit("vote-failed"); // FUTURE: can add round number to be the same here, indicating repeating the mission with new captain
          // (roundNumber, NewCaptain)
        }
        break;
      case 3:
        if (choiceCounter > 0 && playerVoteChoiceLength === 15) {
          console.log("Got to success voting");
          io.emit("vote-succeeded");
          console.log(CHOSEN_PLAYERS);
          CHOSEN_PLAYERS.forEach((socket_id) => {
            console.log(socket_id);
            io.to(socket_id).emit("mission-vote");
          });

          // socket.emit("vote-succeeded"); // FUTURE: can add round # to be incremented indicating next mission
          // Vote Failed
        } else if (choiceCounter <= 0 && playerVoteChoiceLength === 15) {
          // total_fails++
          console.log("Got to failed voting");
          CHOSEN_PLAYERS = "";
          io.emit("vote-failed"); // FUTURE: can add round number to be the same here, indicating repeating the mission with new captain
          // (roundNumber, NewCaptain)
        }
        break;
      case 4:
        if (choiceCounter > 0 && playerVoteChoiceLength === 20) {
          console.log("Got to success voting");
          io.emit("vote-succeeded");
          console.log(CHOSEN_PLAYERS);
          CHOSEN_PLAYERS.forEach((socket_id) => {
            console.log(socket_id);
            io.to(socket_id).emit("mission-vote");
          });

          // socket.emit("vote-succeeded"); // FUTURE: can add round # to be incremented indicating next mission
          // Vote Failed
        } else if (choiceCounter <= 0 && playerVoteChoiceLength === 20) {
          // total_fails++
          console.log("Got to failed voting");
          CHOSEN_PLAYERS = "";
          io.emit("vote-failed"); // FUTURE: can add round number to be the same here, indicating repeating the mission with new captain
          // (roundNumber, NewCaptain)
        }
        break;
      case 5:
        if (choiceCounter > 0 && playerVoteChoiceLength === 25) {
          console.log("Got to success voting");
          io.emit("vote-succeeded");
          console.log(CHOSEN_PLAYERS);
          CHOSEN_PLAYERS.forEach((socket_id) => {
            console.log(socket_id);
            io.to(socket_id).emit("mission-vote");
          });

          // socket.emit("vote-succeeded"); // FUTURE: can add round # to be incremented indicating next mission
          // Vote Failed
        } else if (choiceCounter <= 0 && playerVoteChoiceLength === 25) {
          // total_fails++
          console.log("Got to failed voting");
          CHOSEN_PLAYERS = "";
          io.emit("vote-failed"); // FUTURE: can add round number to be the same here, indicating repeating the mission with new captain
          // (roundNumber, NewCaptain)
        }
        break;
    }
  });

  socket.on("playerMissionChoice", (choice) => {
    console.log("playerMissionChoice handler");
    console.log(`choice: ${choice}`);
    playerVoteChoiceLength_m++;
    if (total_fails == 2 || total_succeeds == 2) {
      if (choice === "Fail") {
        containsFail_m = true;
      }

      if (!containsFail_m && playerVoteChoiceLength_m === 3) {
        // NOTE: NUMBER (2) HERE DEPENDS ON MISSION
        // mission succeeeded
        total_succeeds++;
        if (total_succeeds >= 3) {
          io.emit("endgame-succeed");
        } else io.emit("midgame-restart");
      } else if (containsFail_m && playerVoteChoiceLength_m === 4) {
        total_fails++;
        if (total_fails >= 3) {
          io.emit("endgame-fail");
        } else io.emit("midgame-restart");
      }
    } else {
      if (choice === "Fail") {
        containsFail_m = true;
      }

      if (!containsFail_m && playerVoteChoiceLength_m === 2) {
        // NOTE: NUMBER (2) HERE DEPENDS ON MISSION
        // mission succeeeded
        total_succeeds++;
        if (total_succeeds >= 3) {
          io.emit("endgame-succeed");
        } else io.emit("midgame-restart");
      } else if (containsFail_m && playerVoteChoiceLength_m === 2) {
        total_fails++;
        if (total_fails >= 3) {
          io.emit("endgame-fail");
        } else io.emit("midgame-restart");
      }
    }
  });

  socket.on("guess-merlin", () => {
    tempCounter2 += 1;
    let result = getAllRoles();
    if (tempCounter2 == 5) {
      io.to(data.player_roles.Assassin.Client_id).emit(
        "guess-merlin-client",
        result
      );
    }
  });

  socket.on("assassinate", (potentialMerlin) => {
    console.log(`potentialMerlin: ${potentialMerlin}`);
    console.log(
      `data.player_roles.Merlin.Player_name: ${data.player_roles.Merlin.Player_name}`
    );
    if (
      potentialMerlin.toString() ===
      data.player_roles.Merlin.Player_name.toString()
    ) {
      console.log("got here");
      io.emit("endgame-succeed-2");
    } else {
      io.emit("endgame-fail");
    }
  });
  // function getKeyByValue(object, value) {
  //   return Object.keys(object).find((key) => object[key] === value);
  // }

  // remove socket id from player object
  socket.on("disconnect", () => {
    // let key = getKeyByValue(players, socket.id);
    // players[key] = "";
  });
});

io.listen(3000);
console.log("Sever listening on port 3000!");

/**
 * Global: currentCaptainIndex
 *
 * socket.on("start-round-state") {
 *  const playerNames = Object.keys(players);
 *
 *  nextTurn(playerNames)
 * }
 */
// Get an array of player names

// Function to handle the next turn
function nextTurn() {
  // Get a list of all the players in the game
  const playerNames = Object.keys(data.player_roles);
  console.log("playerNames: " + playerNames);
  const currentCaptainName = playerNames[currentCaptainIndex];

  // Game logic for the current player's turn
  console.log(`${currentCaptainName}'s turn.`);
  // console.log(data.player_roles..Client_id);
  // Move to the next player
  currentCaptainIndex = (currentCaptainIndex + 1) % playerNames.length;
  return data.player_roles[currentCaptainName].Client_id;
}

function getAllButCaptain(clientId) {
  const filteredData = [];
  const rolesData = data.player_roles;

  for (const role in rolesData) {
    if (rolesData[role].Client_id !== clientId) {
      const { Client_id, Player_name } = rolesData[role];
      filteredData.push({ Client_id, Player_name });
    }
  }

  return filteredData;
}

function getAllRoles() {
  const allRoleData = [];
  const rolesData = data.player_roles;

  for (const role in rolesData) {
    const { Client_id, Player_name } = rolesData[role];
    allRoleData.push({ Client_id, Player_name });
  }

  return allRoleData;
}

function ResetMidStateVars() {
  CHOSEN_PLAYERS = "";

  // Vote
  choiceCounter = 0;
  playerVoteChoiceLength = 0;

  // Mission
  containsFail_m = false;
  playerVoteChoiceLength_m = 0;
}

// // add socket id to player obj
// function joinPlayers(clientId) {
//   for (const keyIdx in players) {
//     let curr = players[keyIdx];
//     if (curr == "") {
//       players[keyIdx] = clientId;
//       console.log(players);
//       return;
//     }
//   }
// }

// function getKeyByValue(obj, value) {
//   return Object.keys(obj).find((key) => obj[key] === value);
// }
