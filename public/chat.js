if (!localStorage.getItem("user")) {
  location.href = "index.html";
}

const socket = io();
const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const headerName = document.getElementById("otherName");
const headerDp = document.getElementById("otherDp");

const me = JSON.parse(localStorage.getItem("user"));

/* JOIN ROOM WITH USER */
socket.emit("join", {
  room: me.room,
  user: me
});

/* RECEIVE OTHER USER INFO (NAME + DP) */
socket.on("intro", user => {
  headerName.innerText = user.name;
  if (headerDp) headerDp.src = user.dp;
});

/* TYPING */
input.addEventListener("input", () => {
  socket.emit("typing", {
    room: me.room,
    name: me.name
  });
});

socket.on("typing", name => {
  headerName.innerText = name + " typing...";
  clearTimeout(window._typingTimer);
  window._typingTimer = setTimeout(() => {
    headerName.innerText = headerName.innerText.replace(" typing...", "");
  }, 1000);
});

/* SEND MESSAGE */
function send() {
  const text = input.value.trim();
  if (!text) return;

  addMsg(text, "me", "✔");

  socket.emit("message", {
    room: me.room,
    text
  });

  input.value = "";
}

/* ENTER PRESS TO SEND */
input.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    send();
  }
});

/* RECEIVE MESSAGE */
socket.on("message", data => {
  addMsg(data.text, "other", "");
  socket.emit("seen", me.room);
});

/* SEEN (✔✔ BLUE) */
socket.on("seen", () => {
  const ticks = document.querySelectorAll(".tick");
  if (ticks.length) {
    const last = ticks[ticks.length - 1];
    last.innerText = "✔✔";
    last.style.color = "blue";
  }
});

/* UI HELPER */
function addMsg(text, type, tick) {
  const div = document.createElement("div");
  div.className = "msg " + type;
  div.innerHTML = `
    <span>${text}</span>
    <small class="tick">${tick || ""}</small>
  `;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}
