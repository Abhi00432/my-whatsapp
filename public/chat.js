const messages = document.getElementById("messages");

function send() {
  const input = document.getElementById("msg");
  if (!input.value) return;

  const div = document.createElement("div");
  div.className = "msg me";
  div.innerText = input.value;

  messages.appendChild(div);
  input.value = "";
  messages.scrollTop = messages.scrollHeight;
}

function enterSend(e) {
  if (e.key === "Enter") send();
}
