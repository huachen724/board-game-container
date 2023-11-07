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
let values1 = [];

let started = false;
let playerNameComplete = false;

io.on("connection", (socket) => {
  socket.join("room 1");
  console.log(values1);
  // disconnect if 2 clients connected
  if (io.sockets.sockets.size > 5) {
    console.log("Something went wrong! Too many players tried to connect!");
    socket.disconnect();
  }

  // join server with socket id
  const sockId = socket.id;
  joinPlayers(sockId);

  // get player id (1,2)
  const id = getKeyByValue(players, sockId);
  socket.emit("clientid", sockId);

  socket.on("addToMap", (pair) => {
    values1.push(pair);
    // console.log("values: ");
    // console.log(values1);
    // console.log(Object.keys(values1).length);
    if (values1.length >= 5) {
      console.log("Inside if statement");
      io.to("room 1").emit("enoughPlayers");
      // console.log(io.sockets);
      // console.log(io.sockets.sockets);
      // for (sock in io.sockets) {
      //   console.log("in loop:" + sock);
      //   sock.emit("enoughPlayers");
      // }
    }
  });

  socket.on("start", () => {
    io.to("room 1").emit("hua");
    if (Object.keys(values1).length >= 5) {
      // console.log("hi");
      started = true;
      values = [];
      // Get all the client Id
      // console.log(values1);
      // for (const nested of nestedArray) {
      //   const firstElement = nested[0][0];
      //   // console.log(firstElement);
      //   values.push(firstElement);
      // }
      for (let i = 0; i < Object.keys(values1).length; i++) {
        values.push(values1[i][0]);
        console.log("Values push:" + values1[i][0]);
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
      io.to("room 1").emit("start2", data.player_roles);
      // io.emit("start2", data.player_roles);
      console.log("Match started");
    }
  });

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
