const socket = io();
const chat = document.getElementById("chat");
const input = document.getElementById("msg");

function send() {
  if (!input.value) return;

  const div = document.createElement("div");
  div.className = "msg me";
  div.innerText = input.value;
  chat.appendChild(div);

  socket.emit("message", input.value);
  input.value = "";
}

socket.on("message", msg => {
  const div = document.createElement("div");
  div.className = "msg other";
  div.innerText = msg;
  chat.appendChild(div);
});
