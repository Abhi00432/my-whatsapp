function sendMsg() {
  const input = document.getElementById("msgInput");
  const text = input.value.trim();
  if (!text) return;

  const chat = document.getElementById("chatArea");
  const msg = document.createElement("div");
  msg.className = "msg me";
  msg.innerText = text;

  chat.appendChild(msg);
  input.value = "";
  chat.scrollTop = chat.scrollHeight;
}

document.getElementById("msgInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    sendMsg();
  }
});
document.getElementById("sendBtn").addEventListener("click", sendMsg);    