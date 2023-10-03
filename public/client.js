const socket = io();

// Function to join a room
function joinRoom(roomName) {
  console.log(`joining room ${roomName}`);
  socket.emit("joinRoom", roomName);
  let feedbackLine = document.querySelector(".feedback-line");
  feedbackLine.innerText = "Joining Room...";
}

socket.on("updateRooms", (rooms) => {
  console.log(rooms);
  const roomList = document.querySelector(".room-list");
  for (let roomName in rooms) {
    const li = document.createElement("li");
    li.textContent = roomName;
    li.onclick = function () {
      joinRoom(roomName);
    };
    roomList.appendChild(li);
  }
});

socket.on("roomJoined", (roomName) => {
  console.log(`Joined room: ${roomName}`);
  let feedbackLine = document.querySelector(".feedback-line");
  feedbackLine.innerText = `Joined Room ${roomName}`;
  let choicesCont = document.querySelector(".choices");
  choicesCont.style.display = "block";
});

socket.on("roomFull", () => {
  console.log("Room is full!");
  let feedbackLine = document.querySelector(".feedback-line");
  feedbackLine.innerText = "Room is full!";
});

socket.on("opponentChoice", () => {
  const str = "Opponent has chosen!";
  console.log(str);
  let feedbackLine = document.querySelector(".feedback-line");
  feedbackLine.innerText = str;
});

socket.on("opponentLeft", () => {
  const str = "Opponent left the room.";
  console.log(str);
  let feedbackLine = document.querySelector(".feedback-line");
  feedbackLine.innerText = str;
  // Update the UI to indicate the opponent has left.
});

socket.on("result", (winner) => {
  console.log(winner);
  let str;
  if (winner === "DRAW") {
    str = "It’s a Draw!";
    console.log(str);
  } else if (winner === socket.id) {
    str = "You Win!";
    console.log(str);
  } else {
    str = "You Lose!";
    console.log(str);
  }
  let feedbackLine = document.querySelector(".feedback-line");
  feedbackLine.innerText = str;
});

function makeChoice(choice) {
  socket.emit("choice", choice);
}
