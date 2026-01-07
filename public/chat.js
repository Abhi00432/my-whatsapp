const socket = io();

const name = localStorage.getItem("username");
const dp = localStorage.getItem("dp");
const params = new URLSearchParams(window.location.search);
const to = params.get("user");

if (!name || !to) location.href = "/chats.html";

// HEADER
document.getElementById("chatName").innerText = to;
document.getElementById("headerDp").src =
  dp || "https://i.imgur.com/6VBx3io.png";

socket.emit("join", { name, dp });

const messages = document.getElementById("messages");
const msgInput = document.getElementById("msg");

/* ===== SEND ===== */
function sendMsg() {
  const msg = msgInput.value.trim();
  if (!msg) return;

  addMsg("You", msg, "me");

  socket.emit("private-msg", {
    to,
    from: name,
    msg
  });

  msgInput.value = "";
}

// ENTER SEND
msgInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMsg();
  }
});

/* ===== RECEIVE ===== */
socket.on("private-msg", d => {
  addMsg(d.from, d.msg, "other");
});

/* ===== UI ===== */
function addMsg(user, msg, type) {
  const div = document.createElement("div");
  div.className = "msg " + type;

  // 🔥 NO DP HERE
  div.innerHTML = `
    <div class="bubble">
      <b>${user}</b><br>${msg}
    </div>
  `;

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}
