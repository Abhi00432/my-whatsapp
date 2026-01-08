const socket = io();

const name = localStorage.getItem("name") || "User";
socket.emit("join", name);

const input = document.getElementById("msgInput");
const chat = document.getElementById("chatArea");
const typingDiv = document.getElementById("typing");

function sendMsg() {
  if (!input.value.trim()) return;
  socket.emit("message", input.value);
  input.value = "";
}

socket.on("message", data => {
  const msg = document.createElement("div");
  msg.className = "msg " + (data.name === name ? "me" : "other");
  msg.innerText = `${data.name}: ${data.text}`;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
});

input.addEventListener("input", () => {
  socket.emit("typing", name);
});

socket.on("typing", user => {
  typingDiv.style.display = "block";
  typingDiv.innerText = `${user} typing...`;
  setTimeout(() => typingDiv.style.display = "none", 1000);
});

input.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMsg();
});
