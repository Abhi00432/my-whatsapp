const socket = io();

const my = localStorage.getItem("name");
const to = localStorage.getItem("toName");

h.innerText = to;

/* ===== SEND TEXT ===== */
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

/* ===== RECEIVE TEXT ===== */
socket.on("private-msg", data => {
  add("other", data.msg);
});

/* ===== TYPING UI ===== */
socket.on("typing", () => {
  typing.style.display = "block";
  clearTimeout(window.t);
  window.t = setTimeout(() => {
    typing.style.display = "none";
  }, 1000);
});

/* ===== MESSAGE UI ===== */
function add(cls, text) {
  const d = document.createElement("div");
  d.className = "msg " + cls;

  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  d.innerHTML = `
    <div>${text}</div>
    <div class="time">${time}</div>
    <div class="reactions">
      <span>👍</span>
      <span>❤️</span>
      <span>😂</span>
    </div>
  `;

  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}
