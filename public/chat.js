const socket = io();

const myName = localStorage.getItem("name");
const toName = localStorage.getItem("toName");

h.innerText = toName;

// 🔥 re-join (new socket id safe)
socket.emit("join", myName);

function sendMsg() {
  if (!msg.value.trim()) return;

  socket.emit("private-msg", {
    to: toName,
    from: myName,
    msg: msg.value
  });

  add("me", msg.value);
  msg.value = "";
}

// ✅ ENTER PRESS SEND
msg.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMsg();
  } else {
    socket.emit("typing", toName);
  }
});

socket.on("private-msg", data => {
  add("other", data.from + ": " + data.msg);
});

socket.on("typing", () => {
  typing.style.display = "block";
  setTimeout(() => typing.style.display = "none", 1000);
});

function add(cls, text) {
  const d = document.createElement("div");
  d.className = "msg " + cls;
  d.innerText = text;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}
