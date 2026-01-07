// ===== SOCKET INIT =====
const socket = io();

// ===== USER DATA =====
const name = localStorage.getItem("username");
const dp = localStorage.getItem("dp");

if (!name) {
  window.location.href = "/";
}

// ===== DOM =====
const messages = document.getElementById("messages");
const msgInput = document.getElementById("msg");
const photoInput = document.getElementById("photo");

// ===== JOIN =====
socket.emit("join", { name, dp });

// ===== ENTER PRESS SEND =====
msgInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendMsg();
  }
});

// ===== SEND TEXT =====
function sendMsg() {
  const msg = msgInput.value.trim();
  if (!msg) return;

  const data = { name, msg, dp };

  addMessage(data, "me");
  socket.emit("chat", data);
  msgInput.value = "";
}

// ===== RECEIVE TEXT =====
socket.on("chat", (data) => {
  addMessage(data, "other");
});

// ===== ADD MESSAGE UI =====
function addMessage(data, type) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;

  div.innerHTML = `
    <b>${data.name}</b><br>
    ${data.msg || ""}
  `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// ===== IMAGE SEND =====
if (photoInput) {
  photoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const data = {
        name,
        img: reader.result
      };

      addImage(data, "me");
      socket.emit("image", data);
    };
    reader.readAsDataURL(file);
  });
}

// ===== RECEIVE IMAGE =====
socket.on("image", (data) => {
  addImage(data, "other");
});

function addImage(data, type) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;

  div.innerHTML = `
    <b>${data.name}</b><br>
    <img src="${data.img}" style="max-width:180px;border-radius:8px;">
  `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// ===== VOICE MESSAGE =====
let mediaRecorder;
let audioChunks = [];

navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = e => {
      audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      audioChunks = [];

      const reader = new FileReader();
      reader.onload = () => {
        const data = {
          name,
          audio: reader.result
        };

        addVoice(data, "me");
        socket.emit("voice", data);
      };
      reader.readAsDataURL(blob);
    };
  })
  .catch(() => {
    console.log("Mic permission denied");
  });

// start / stop voice (buttons se call karo)
function startVoice() {
  if (mediaRecorder && mediaRecorder.state === "inactive") {
    mediaRecorder.start();
  }
}

function stopVoice() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }
}

// ===== RECEIVE VOICE =====
socket.on("voice", (data) => {
  addVoice(data, "other");
});

function addVoice(data, type) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;

  div.innerHTML = `
    <b>${data.name}</b><br>
    <audio controls src="${data.audio}"></audio>
  `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  
}
