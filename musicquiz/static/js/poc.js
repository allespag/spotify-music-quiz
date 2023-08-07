// proof of concept using socketio

console.log("poc.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  socket.on("connect", () => {
    console.log("Connected to the server.");
  });
});
