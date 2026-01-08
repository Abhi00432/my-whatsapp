const socket = io();

const myName = localStorage.getItem("name");
const toName = localStorage.getItem("toName");

h.innerText = toName;

// 🔥 JOIN AGAIN (new socket id mapping)
socket.emit("join", myName);

function send() {
  if (!msg.value.trim()) return;

  socket.emit("private-msg", {
    toName,
    from: myName,
    msg: msg.value
  });

  add("me", msg.value);
  msg.value = "";
}

socket.on("private-msg", data => {
  add("other", data.from + ": " + data.msg);
});

function add(cls, text) {
  const d = document.createElement("div");
  d.className = "msg " + cls;
  d.innerText = text;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}
