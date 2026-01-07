// ================= SOCKET =================
const socket = io();

// ================= USER DATA =================
const name = localStorage.getItem("username");
const dp = localStorage.getItem("dp");
const params = new URLSearchParams(location.search);
const to = params.get("user");

if (!name || !to) {
  location.href = "/chats.html";
}

// ================= JOIN =================
socket.emit("join", { name, dp });

// ================= DOM =================
const messages = document.getElementById("messages");
const msgInput = document.getElementById("msg");
const photoInput = document.getElementById("photo");
const chatWith = document.getElementById("chatWith");
const typingEl = document.getElementById("typing");

chatWith.innerText = to;

// ================= TEXT SEND =================
function sendMsg() {
  const msg = msgInput.value.trim();
  if (!msg) return;

  addMsg(name, msg, "me", dp);

  socket.emit("private-msg", {
    to,
    from: name,
    msg
  });

  msgInput.value = "";
}

// ENTER PRESS SEND
msgInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMsg();
  } else {
    socket.emit("typing", { to, from: name });
  }
});

// RECEIVE TEXT
socket.on("private-msg", (d) => {
  addMsg(d.from, d.msg, "other", d.dp);
});

// ================= IMAGE SEND =================
photoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    socket.emit("private-image", {
      to,
      from: name,
      img: reader.result
    });

    addImage(name, reader.result, "me", dp);
  };
  reader.readAsDataURL(file);
});

// RECEIVE IMAGE
socket.on("private-image", (d) => {
  addImage(d.from, d.img, "other", d.dp);
});

// ================= VOICE MESSAGE (FIXED) =================
let mediaRecorder;
let audioChunks = [];
let recording = false;

// mic permission
navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) audioChunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    if (audioChunks.length === 0) return;

    const blob = new Blob(audioChunks, { type: "audio/webm" });
    audioChunks = [];

    // 🔥 FIX: ensure duration > 0
    if (blob.size < 1000) return;

    const reader = new FileReader();
    reader.onload = () => {
      socket.emit("private-voice", {
        to,
        from: name,
        audio: reader.result
      });

      addVoice(name, reader.result, "me", dp);
    };
    reader.readAsDataURL(blob);
  };
});

// press & hold 🎤
function startVoice() {
  if (!mediaRecorder || recording) return;
  recording = true;
  audioChunks = [];
  mediaRecorder.start();
}

function stopVoice() {
  if (!mediaRecorder || !recording) return;
  recording = false;
  mediaRecorder.stop();
}

// RECEIVE VOICE
socket.on("private-voice", (d) => {
  addVoice(d.from, d.audio, "other", d.dp);
});

// ================= TYPING =================
socket.on("typing", (u) => {
  typingEl.innerText = `${u} typing...`;
  setTimeout(() => typingEl.innerText = "", 1000);
});

// ================= UI HELPERS =================
function addMsg(user, msg, type, dpImg) {
  const div = document.createElement("div");
  div.className = "msg " + type;
  div.innerHTML = `
    <img class="dp" src="${dpImg || 'https://i.imgur.com/6VBx3io.png'}">
    <div>
      <b>${user}</b><br>${msg}
    </div>
  `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function addImage(user, img, type, dpImg) {
  const div = document.createElement("div");
  div.className = "msg " + type;
  div.innerHTML = `
    <img class="dp" src="${dpImg || 'https://i.imgur.com/6VBx3io.png'}">
    <div>
      <b>${user}</b><br>
      <img src="${img}" style="max-width:180px;border-radius:8px">
    </div>
  `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function addVoice(user, audio, type, dpImg) {
  const div = document.createElement("div");
  div.className = "msg " + type;
  div.innerHTML = `
    <img class="dp" src="${dpImg || 'https://i.imgur.com/6VBx3io.png'}">
    <div>
      <b>${user}</b><br>
      <audio controls src="${audio}"></audio>
    </div>
  `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}
// ================= PRIVATE CALLING (BASIC) =================
let pc; // RTCPeerConnection
const config = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};      