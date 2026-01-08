const socket = io();

const my = localStorage.getItem("name");
const to = localStorage.getItem("toName");

if (!my || !to) location.href = "chats.html";

h.innerText = to;

// ✅ join again is SAFE now
socket.emit("join", my);

function sendMsg() {
  if (!msg.value.trim()) return;

  socket.emit("private-msg", {
    from: my,
    to,
    msg: msg.value
  });

  add("me", msg.value);
  msg.value = "";
}

msg.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMsg();
  } else {
    socket.emit("typing", to);
  }
});

socket.on("private-msg", data => {
  add("other", data.msg);
});

socket.on("typing", () => {
  typing.style.display = "block";
  clearTimeout(window.t);
  window.t = setTimeout(() => {
    typing.style.display = "none";
  }, 800);
});

function add(cls, text) {
  const d = document.createElement("div");
  d.className = "msg " + cls;
  d.innerText = text;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}
