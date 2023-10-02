const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3010;

let rooms = {};
let playerList = {};

function updateRooms() {
  io.to("lobby").emit("updateRooms", rooms);
}

function updatePlayerList(id, roomName) {
  playerList[id] = roomName;
}

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  // Join the user to the lobby
  socket.join("lobby");
  updatePlayerList(socket.id, "lobby");
  updateRooms();

  socket.on("joinRoom", (roomName) => {
    let room = rooms[roomName];

    if (!room) {
      console.log(`creating room ${roomName}`);
      socket.join(roomName);
      updatePlayerList(socket.id, roomName);
      rooms[roomName] = {
        player1: socket.id,
        player2: null,
        choices: {
          p1choice: null,
          p2choice: null,
        },
      };
      updateRooms();
    } else if (!room.player2) {
      socket.join(roomName);
      updatePlayerList(socket.id, roomName);
      room.player2 = socket.id;
      updateRooms();
    } else {
      socket.emit("roomFull");
      return;
    }

    socket.emit("roomJoined", roomName);
  });

  socket.on("choice", (choice) => {
    console.log(`${socket.id} submitted choice ${choice}`);
    const roomName = playerList[socket.id];
    const room = rooms[roomName];

    if (room && room.player1 && room.player2) {
      if (room.player1 === socket.id) {
        room.choices["p1choice"] = choice;
      } else if (room.player2 === socket.id) {
        room.choices["p2choice"] = choice;
      }
      socket.broadcast
        .to(room.player1 === socket.id ? room.player2 : room.player1)
        .emit("opponentChoice");

      if (room.choices["p1choice"] && room.choices["p2choice"]) {
        const result = decideWinner(
          room.choices["p1choice"],
          room.choices["p2choice"]
        );
        let winner;
        switch (result) {
          case 1:
            winner = room.player1;
            break;
          case 2:
            winner = room.player2;
            break;
          case 0:
            winner = "TIE";
            break;
          default:
            winner = "ERROR";
            break;
        }

        io.to(roomName).emit("result", winner);

        // Reset choices
        room.choices["p1choice"] = null;
        room.choices["p2choice"] = null;
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
    let roomName = playerList[socket.id];
    if (!roomName) return; // Exit if no roomName for socket.id

    let room = rooms[roomName];
    if (!room) return; // Exit if no room for roomName

    // Handle player disconnection and cleanup
    if (room.player1 === socket.id) {
      room.player1 = null;
    } else if (room.player2 === socket.id) {
      room.player2 = null;
    }

    const otherPlayer =
      room.player1 === socket.id ? room.player2 : room.player1;
    if (otherPlayer) {
      socket.broadcast.to(otherPlayer).emit("opponentLeft");
    }

    if (!room.player1 && !room.player2) {
      delete rooms[roomName];
      delete playerList[socket.id]; // Clear entry from playerList
    }
  });
});

function decideWinner(choice1, choice2) {
  // If the choices are the same, it's a tie.
  if (choice1 === choice2) {
    return 0;
  }

  const rules = {
    rock: {
      scissors: 1,
      paper: 2,
    },
    paper: {
      rock: 1,
      scissors: 2,
    },
    scissors: {
      rock: 2,
      paper: 1,
    },
  };

  return rules[choice1] && rules[choice1][choice2]
    ? rules[choice1][choice2]
    : -1;
}

app.use(express.static("public"));
server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
