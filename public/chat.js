import { encrypt, decrypt, key } from "./crypto.js";

const socket = io();
const chat = document.getElementById("chat");
const input = document.getElementById("msg");

window.send = async () => {
  const enc = await encrypt(input.value);
  socket.emit("private-message", enc);
  input.value = "";
};

socket.on("private-message", async data => {
  const text = await decrypt(data);
  chat.innerHTML += `<div>${text}</div>`;
});
