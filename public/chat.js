const socket = io();

// ===== USER DATA =====
const name = localStorage.getItem("username");
const myDp = localStorage.getItem("dp");
const to = new URLSearchParams(location.search).get("user");

if (!name || !to) location.href = "/chats.html";

// ===== HEADER =====
document.getElementById("chatWith").innerText = to;
document.getElementById("headerDp").src =
  myDp || "https://i.imgur.com/6VBx3io.png";

// ===== JOIN (SEND DP TO SERVER) =====
socket.emit("join", { name, dp: myDp });

// ===== DOM =====
const messages = document.getElementById("messages");
const msgInput = document.getElementById("msg");
const photoInput = document.getElementById("photo");

/* ================= TEXT ================= */
function sendMsg() {
  const msg = msgInput.value.trim();
  if (!msg) return;

  addMsg("You", msg, "me", myDp);

  socket.emit("private-msg", {
    to,
    from: name,
    msg
  });

  msgInput.value = "";
}

// Enter press send
msgInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMsg();
  }
});

// Receive text
socket.on("private-msg", d => {
  addMsg(d.from, d.msg, "other", d.dp);
});

/* ================= IMAGE ================= */
photoInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    addImage("You", reader.result, "me", myDp);

    socket.emit("private-image", {
      to,
      from: name,
      img: reader.result
    });
  };
  reader.readAsDataURL(file);
};

socket.on("private-image", d => {
  addImage(d.from, d.img, "other", d.dp);
});

/* ================= VOICE (FIXED 0:00) ================= */
let recorder, chunks = [], recording = false;

navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
  recorder = new MediaRecorder(stream);

  recorder.ondataavailable = e => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.onstop = () => {
    if (chunks.length === 0) return;

    const blob = new Blob(chunks, { type: "audio/webm" });
    chunks = [];

    if (blob.size < 1000) return; // prevent 0:00

    const reader = new FileReader();
    reader.onload = () => {
      addVoice("You", reader.result, "me", myDp);

      socket.emit("private-voice", {
        to,
        from: name,
        audio: reader.result
      });
    };
    reader.readAsDataURL(blob);
  };
});

function startVoice() {
  if (!recorder || recording) return;
  recording = true;
  chunks = [];
  recorder.start();
}

function stopVoice() {
  if (!recorder || !recording) return;
  recording = false;
  recorder.stop();
}

socket.on("private-voice", d => {
  addVoice(d.from, d.audio, "other", d.dp);
});

/* ================= UI HELPERS ================= */
function addMsg(user, msg, type, dp) {
  const d = document.createElement("div");
  d.className = "msg " + type;
  d.innerHTML = `
    <img class="dp" src="${dp || 'https://i.imgur.com/6VBx3io.png'}">
    <div>
      <b>${user}</b><br>${msg}
    </div>
  `;
  messages.appendChild(d);
  messages.scrollTop = messages.scrollHeight;
}

function addImage(user, img, type, dp) {
  const d = document.createElement("div");
  d.className = "msg " + type;
  d.innerHTML = `
    <img class="dp" src="${dp || 'https://i.imgur.com/6VBx3io.png'}">
    <div>
      <b>${user}</b><br>
      <img src="${img}" class="img-msg">
    </div>
  `;
  messages.appendChild(d);
  messages.scrollTop = messages.scrollHeight;
}

function addVoice(user, audio, type, dp) {
  const d = document.createElement("div");
  d.className = "msg " + type;
  d.innerHTML = `
    <img class="dp" src="${dp || 'https://i.imgur.com/6VBx3io.png'}">
    <div>
      <b>${user}</b><br>
      <audio controls src="${audio}"></audio>
    </div>
  `;
  messages.appendChild(d);
  messages.scrollTop = messages.scrollHeight;
}
  