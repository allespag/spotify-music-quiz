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
    const playlists = document.getElementById("playlists");
    const playlistID = playlists.options[playlists.selectedIndex].value;

    if (roomID && playlistID) {
      socket.emit("room_created", { room_id: roomID, playlist_id: playlistID });
    }
  }

  document
    .getElementById("sendRoomCreatedButton")
    .addEventListener("click", sendRoomCreated);
});
