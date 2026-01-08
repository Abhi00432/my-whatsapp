const input = document.getElementById("msgInput");
const chat = document.getElementById("chatArea");
const typing = document.getElementById("typing");

function sendMsg() {
  if (!input.value.trim()) return;

  const msg = document.createElement("div");
  msg.className = "msg me";
  msg.innerText = input.value;
  chat.appendChild(msg);

  input.value = "";
  chat.scrollTop = chat.scrollHeight;
}

input.addEventListener("input", () => {
  typing.style.display = "block";
  setTimeout(() => typing.style.display = "none", 1000);
});

input.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMsg();
});
