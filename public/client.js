const socket = io();

// Function to join a room
function joinRoom(roomName) {
  console.log(`joining room ${roomName}`);
  socket.emit("joinRoom", roomName);
}

socket.on("updateRooms", (rooms) => {
  console.log(rooms);
  const roomList = document.querySelector(".room-list");
  for (let roomName in rooms) {
    // Create a new <li> element
    const li = document.createElement("li");
    // Set the text content of the <li> to the room name
    li.textContent = roomName;
    // Set onclick
    li.onclick = function () {
      joinRoom(roomName);
    };
    // Append the <li> to the .room-list element
    roomList.appendChild(li);
  }
});

socket.on("roomJoined", (roomName) => {
  console.log(`Joined room: ${roomName}`);
  let choicesCont = document.querySelector(".choices");
  choicesCont.style.display = "block";
});

socket.on("roomFull", () => {
  console.log("Room is full!");
  // Update the UI to indicate room is full or allow choosing another room.
});

socket.on("opponentChoice", () => {
  console.log("Opponent has chosen!");
});

socket.on("opponentLeft", () => {
  console.log("Opponent left the room.");
  // Update the UI to indicate the opponent has left.
});

socket.on("result", (winner) => {
  console.log(winner);
  if (winner === "DRAW") {
    console.log("It’s a Draw!");
  } else if (winner === socket.id) {
    console.log("You Win!");
  } else {
    console.log("You Lose!");
  }
  // Update the UI based on results.
});

function makeChoice(choice) {
  socket.emit("choice", choice);
}

// Call joinRoom with the desired room name when you want to join.
// For example: joinRoom('room1');
