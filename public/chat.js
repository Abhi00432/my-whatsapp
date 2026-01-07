const socket = io();

const name = localStorage.getItem("username");
const dp = localStorage.getItem("dp");

if (!name) location.href = "/";

document.getElementById("chatName").innerText = name;
document.getElementById("headerDp").src =
  dp || "https://i.imgur.com/6VBx3io.png";

const messages = document.getElementById("messages");
const msgInput = document.getElementById("msg");

socket.emit("join", { name, dp });

function sendMsg() {
  const msg = msgInput.value.trim();
  if (!msg) return;

  addMsg("You", msg, "me");
  socket.emit("private-msg", { msg, from: name });
  msgInput.value = "";
}

msgInput.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMsg();
});

socket.on("private-msg", d => {
  addMsg(d.from, d.msg, "other");
});

function addMsg(user, msg, type) {
  const div = document.createElement("div");
  div.className = "msg " + type;
  div.innerHTML = `<b>${user}</b><br>${msg}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}
