const socket = io();
const name = localStorage.getItem("name");
const to = localStorage.getItem("to");
h.innerText = localStorage.getItem("toName");

socket.emit("join", name);

function send() {
  if (!msg.value) return;
  socket.emit("private-msg", { to, msg: msg.value });
  add("me", msg.value);
  msg.value = "";
}

socket.on("private-msg", data => {
  add("other", data.name + ": " + data.msg);
});

function add(cls, text) {
  const d = document.createElement("div");
  d.className = "msg " + cls;
  d.innerText = text;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}
msg.addEventListener("input", () => {
  socket.emit("typing", to);
});

socket.on("typing", name => {
  typing.innerText = name + " is typing...";
  clearTimeout(typing.timeout);
  typing.timeout = setTimeout(() => {
    typing.innerText = "";
  }, 1000);
}); 