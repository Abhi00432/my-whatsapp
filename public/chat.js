// safety: direct chat.html open na ho
if (!localStorage.getItem("user")) {
  location.href = "index.html";
}

const socket = io();
const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const header = document.getElementById("otherName");

const me = JSON.parse(localStorage.getItem("user"));

/* JOIN ROOM (STRING ONLY) */
socket.emit("join", me.room);

/* SEND MY INFO */
socket.emit("intro", me);

/* RECEIVE OTHER USER INFO */
socket.on("intro", user => {
  header.innerText = user.name;
});

/* SEND MESSAGE */
function send() {
  if (!input.value.trim()) return;

  addMsg(input.value, "me");

  socket.emit("message", {
    room: me.room,
    text: input.value
  });

  input.value = "";
}

/* RECEIVE MESSAGE */
socket.on("message", data => {
  addMsg(data.text, "other");
});

/* UI MESSAGE ADD */
function addMsg(text, type) {
  const div = document.createElement("div");
  div.className = "msg " + type;
  div.innerText = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}
