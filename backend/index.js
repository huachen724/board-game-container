const data = require("./data.json");

// add cors https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
const options = {
  cors: true,
};

const io = require("socket.io")(options);
let roleData = [];
let players = {
  1: "",
  2: "",
  3: "",
  4: "",
  5: "",
};
let clientIdPlayerNamePair = [];

let started = false;
let playerNameComplete = false;

io.on("connection", (socket) => {
  // socket.join("room 1");
  // console.log(clientIdPlayerNamePair);
  // disconnect if 2 clients connected
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
      // Get all the client Id
      // console.log(clientIdPlayerNamePair);
      // for (const nested of nestedArray) {
      //   const firstElement = nested[0][0];
      //   // console.log(firstElement);
      //   values.push(firstElement);
      // }
      for (let i = 0; i < Object.keys(clientIdPlayerNamePair).length; i++) {
        values.push(clientIdPlayerNamePair[i][0]);
        console.log("Values push:" + clientIdPlayerNamePair[i][0]);
      }
      // Shuffle
      for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [values[i], values[j]] = [values[j], values[i]];
      }

      let counter1 = 0;
      // Set the client id
      for (const role in data.player_roles) {
        const roleData = data.player_roles[role];
        roleData.Client_id = values[counter1];
        counter1++;
      }

      let counter5 = 0;
      // Set the player name
      for (const role in data.player_roles) {
        const roleData = data.player_roles[role];
        roleData.Player_name = values[0][counter5];
        counter5++;
      }
      // // Set the player name
      // for (const role in data.player_roles) {
      //   const roleData = data.player_roles[role];
      //   roleData.Player_name = playerNames[roleData.Client_id];
      //   // if (roleData.Client_id == playerNames[])
      //   // if (roleData == playerId) {
      //   //   roleData.Client_id = playerName;
      //   // }
      //   // counter++;
      // }
      playerNameComplete = true;
      // console.log(data.player_roles);
      io.emit("assignRoles", data.player_roles);
      // io.emit("start2", data.player_roles);
      console.log("Match started");
      console.log("let assigned roles know other roles");
      // UrRole  -> knows: [name, name] (returns playerName of [name,name])
      // Return clientId and knows as a pair?
      let knownRolesBasedOnClientId = [];

      io.emit("otherRoles", [
        {
          clientId: data.player_roles.Assassin.Client_id,
          knows: [data.player_roles.Morgana.playerName], // only knows bad guy, not unique role
        },
        {
          clientId: data.player_roles.Merlin.Client_id,
          knows: [
            data.player_roles.Morgana.playerName,
            data.player_roles.Assassin.playerName,
          ], // all the bad guys, thats it
        },
        {
          clientId: data.player_roles.Percival.Client_id,
          knows: [
            data.player_roles.Merlin.playerName,
            data.player_roles.Morgana.playerName,
          ], // only knows bad guy, not unique role
        },
        {
          clientId: data.player_roles.Morgana.Client_id,
          knows: [data.player_roles.Assassin.playerName], // only knows bad guy, not unique role
        },
        {
          clientId: data.player_roles.Good_guy.Client_id,
          knows: [], // only knows bad guy, not unique role
        },
      ]);
    }
  });

  // const getRoles = (data) => {
  //   let roleArr = [];
  //   for (role in data.player_roles) {
  //     const clientId = role.Client_id;
  //     const playerName = role.Player_name;
  //     if (role == "")
  //     const knows = data.role_definition[role].Game_of_five.Knows;
  //     roleArr.push([clientId, playerName, knows]);
  //   }
  // };

  // start the game when 5 players connect
  // if (io.sockets.sockets.size == 5 && !started && playerName) {
  // }

  // send out the current state of the field + active id to continue game
  if (started) {
    console.log("Started is true");
    //Shuffle the values array to ensure uniqueness
    const shuffledValues = [...values];
    for (let i = shuffledValues.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledValues[i], shuffledValues[j]] = [
        shuffledValues[j],
        shuffledValues[i],
      ];
    }

    console.log(roleData);

    socket.emit("continue", data.player_roles);
  }

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
