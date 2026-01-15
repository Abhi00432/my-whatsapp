import { encrypt, decrypt } from "./crypto.js";

const socket = io();
const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const header = document.getElementById("otherName");

const me = JSON.parse(localStorage.getItem("user"));

/* ✅ JOIN ROOM (STRING ONLY) */
socket.emit("join", me.room);

/* ✅ SEND INTRO */
socket.emit("intro", me);

/* RECEIVE OTHER USER INFO */
socket.on("intro", user => {
  header.innerText = user.name;
  document.getElementById("otherDp").src = user.dp;
});

/* TYPING */
input.addEventListener("input", () => {
  socket.emit("typing", { room: me.room, name: me.name });
});

socket.on("typing", name => {
  header.innerText = name + " typing...";
  setTimeout(() => {
    header.innerText = name;
  }, 1000);
});

/* SEND MESSAGE */
async function send() {
  if (!input.value) return;

  const encrypted = await encrypt(input.value);

  addMsg(input.value, "me", "✔");

  socket.emit("message", {
    room: me.room,
    payload: encrypted
  });

  input.value = "";
}

/* RECEIVE MESSAGE */
socket.on("message", async data => {
  const text = await decrypt(data.payload);
  addMsg(text, "other", "");
  socket.emit("seen", me.room);
});

/* SEEN */
socket.on("seen", () => {
  const ticks = document.querySelectorAll(".tick");
  if (ticks.length) {
    ticks[ticks.length - 1].innerText = "✔✔";
    ticks[ticks.length - 1].style.color = "blue";
  }
});

function addMsg(text, type, tick) {
  const div = document.createElement("div");
  div.className = "msg " + type;
  div.innerHTML = `<span>${text}</span><small class="tick">${tick}</small>`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}
