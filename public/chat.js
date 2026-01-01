const socket = io();

const msgInput = document.getElementById("msg");
const messages = document.getElementById("messages");

function send() {
  if (msgInput.value.trim() === "") return;

  addMessage(msgInput.value, true);
  socket.emit("message", msgInput.value);
  msgInput.value = "";
}

function addMessage(text, mine = false) {
  const div = document.createElement("div");
  div.className = "msg" + (mine ? " me" : "");
  div.innerText = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

msgInput.addEventListener("input", () => {
  socket.emit("typing");
});

socket.on("message", (msg) => {
  addMessage(msg, false);
});

socket.on("typing", () => {
  // typing indicator
  let typing = document.getElementById("typing");
  if (!typing) {
    typing = document.createElement("div");
    typing.id = "typing";
    typing.innerText = "Typing...";
    typing.style.fontSize = "12px";
    messages.appendChild(typing);
  }

  setTimeout(() => {
    typing?.remove();
  }, 1000);
});

function enterSend(e) {
  if (e.key === "Enter") send();
}
