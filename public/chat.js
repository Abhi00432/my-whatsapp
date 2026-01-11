import { encrypt, decrypt } from "./crypto.js";

const socket = io();
const chat = document.getElementById("chat");
const input = document.getElementById("msg");

const me = JSON.parse(localStorage.getItem("user"));
socket.emit("join", me);

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

socket.on("message", async data => {
  const text = await decrypt(data.payload);
  addMsg(text, "other", "");
});

function addMsg(text, type, tick) {
  const div = document.createElement("div");
  div.className = "msg " + type;
  div.innerHTML = `<span>${text}</span><small class="tick">${tick}</small>`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}
input.addEventListener("keydown", e => {
  if (e.key === "Enter") send();
});
input.addEventListener("input", () => {
  socket.emit("typing", { room: me.room, name: me.name });
});

const typingDiv = document.getElementById("typing");
let typingTimeout;    
socket.on("typing", name => {
  typingDiv.innerText = `${name} is typing...`;
  clearTimeout(typingTimeout);    
  typingTimeout = setTimeout(() => {
    typingDiv.innerText = "";
  }, 1000);
});