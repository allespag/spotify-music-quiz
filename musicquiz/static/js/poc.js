console.log("poc.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  socket.on("connect", () => {
    console.log("Connected to the server.");
  });

  function sendMessage() {
    socket.emit("room_joined", { salut: 0 });
  }
  document
    .getElementById("sendMessageButton")
    .addEventListener("click", sendMessage);
});
