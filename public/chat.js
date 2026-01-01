const socket = io();
const username = localStorage.getItem("username") || "Guest";

const msgInput = document.getElementById("msg");
const box = document.getElementById("chat-box");
const typing = document.getElementById("typing");

msgInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMsg();
  } else {
    socket.emit("typing", username);
  }
});

msgInput.addEventListener("keyup", () => {
  setTimeout(() => socket.emit("stopTyping"), 800);
});

function sendMsg() {
  const text = msgInput.value.trim();
  if (!text) return;

  socket.emit("chatMessage", {
    user: username,
    msg: text,
    time: new Date().toLocaleTimeString()
  });

  msgInput.value = "";
}

socket.on("chatMessage", data => {
  const div = document.createElement("div");
  div.className = data.user === username ? "me" : "other";
  div.innerHTML = `<b>${data.user}</b><br>${data.msg}<small>${data.time}</small>`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
});

socket.on("typing", user => {
  if (user !== username) typing.innerText = `${user} typing...`;
});

socket.on("stopTyping", () => typing.innerText = "");
