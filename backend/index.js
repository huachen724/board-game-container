const data = require("./data.json");

// add cors https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
const options = {
  cors: true,
};

const io = require("socket.io")(options);
let roleData = [];
let clientIdPlayerNamePair = [];

let started = false;
let playerNameComplete = false;
let players = {
  1: "",
  2: "",
  3: "",
  4: "",
  5: "",
};
let sawOtherRolesCounter = 0;

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
    clientIdPlayerNamePair.push(pair);
    console.log(clientIdPlayerNamePair);
    if (clientIdPlayerNamePair.length >= 5) {
      console.log("Inside if statement");
      io.emit("fivePlayersJoined");
    }
  });

  socket.on("start", () => {
    // io.to("room 1").emit("hua");
    console.log("Got to start stage");
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

      let knownRolesBasedOnClientId = [];
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
    console.log("do ig et here?");
    sawOtherRolesCounter++;
    console.log(sawOtherRolesCounter);
    if (sawOtherRolesCounter === 5) {
      io.emit("go-to-mid-state");
    }
  });

  socket.on("mid-state-start", () => {
    console.log("Got to here");
    io.emit("mid-state", "hi");
  });

  function getKeyByValue(object, value) {
    return Object.keys(object).find((key) => object[key] === value);
  }

  // remove socket id from player object
  socket.on("disconnect", () => {
    let key = getKeyByValue(players, socket.id);
    players[key] = "";
  });
});

io.listen(3000);
console.log("Sever listening on port 3000!");

// add socket id to player obj
function joinPlayers(clientId) {
  for (const keyIdx in players) {
    let curr = players[keyIdx];
    if (curr == "") {
      players[keyIdx] = clientId;
      console.log(players);
      return;
    }
  }
}

function getKeyByValue(obj, value) {
  return Object.keys(obj).find((key) => obj[key] === value);
}
