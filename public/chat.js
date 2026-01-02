const socket = io();

const username = localStorage.getItem("username");
if (!username) location.href = "join.html";

socket.emit("join", username);

const messages = document.getElementById("messages");
const input = document.getElementById("msg");

let typingDiv = null;

/* helper */
function addInfo(text) {
  const div = document.createElement("div");
  div.className = "info";
  div.innerText = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function addMessage(text, cls) {
  const div = document.createElement("div");
  div.className = cls;
  div.innerText = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

/* SEND */
function sendMessage() {
  const msg = input.value.trim();
  if (!msg) return;

  addMessage("You: " + msg, "my-msg");
  socket.emit("send-message", msg);

  input.value = "";
  socket.emit("stop-typing");
}

/* ENTER */
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  } else {
    socket.emit("typing");
  }
});

/* RECEIVE */
socket.on("receive-message", (data) => {
  addMessage(data.user + ": " + data.message, "other-msg");
});

/* INFO (online / offline) */
socket.on("info", (text) => {
  addInfo(text);
});

/* TYPING TEXT (UI SAME, info style) */
socket.on("typing", (user) => {
  if (typingDiv) return;

  typingDiv = document.createElement("div");
  typingDiv.className = "info";
  typingDiv.innerText = `${user} is typing...`;

  messages.appendChild(typingDiv);
  messages.scrollTop = messages.scrollHeight;
});

socket.on("stop-typing", () => {
  if (typingDiv) {
    typingDiv.remove();
    typingDiv = null;
  }
});
