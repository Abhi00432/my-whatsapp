const socket = io();
const chat = document.getElementById("chat");
const input = document.getElementById("msg");

const me = JSON.parse(localStorage.getItem("user"));

socket.emit("join", me.room);
socket.emit("intro", me);

socket.on("intro", user => {
  document.getElementById("otherName").innerText = user.name;
  document.getElementById("otherDp").src = user.dp;
});

function send() {
  if (!input.value) return;

  addMsg(input.value, "me");

  socket.emit("message", {
    room: me.room,
    msg: input.value,
    user: me
  });

  input.value = "";
}

socket.on("message", data => {
  addMsg(data.msg, "other");
});

function addMsg(text, type) {
  const div = document.createElement("div");
  div.className = "msg " + type;
  div.innerText = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}
input.addEventListener("keyup", e => {
  if (e.key === "Enter") send();
});
document.getElementById("sendBtn").onclick = send;  
        