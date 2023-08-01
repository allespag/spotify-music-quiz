document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  socket.on("connect", () => {
    console.log("Connected to the server.");
  });

  socket.on("redirect", function (data) {
    window.location = data.url;
  });

  function sendRoomCreated() {
    const roomID = document.getElementById("roomID").value;

    if (roomID) {
      socket.emit("room_created", { room_id: roomID });
    }
  }

  document
    .getElementById("sendRoomCreatedButton")
    .addEventListener("click", sendRoomCreated);
});
