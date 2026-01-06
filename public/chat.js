const socket = io();
let name = "";
let mediaRecorder;
let audioChunks = [];

function join() {
  name = document.getElementById("username").value;
  if (!name) return;
  socket.emit("join", name);
  document.getElementById("login").style.display = "none";
  document.getElementById("chat").style.display = "block";
}

const msgInput = document.getElementById("msg");

msgInput.addEventListener("keypress", (e) => {
  socket.emit("typing", name);
  if (e.key === "Enter") send();
});

msgInput.addEventListener("blur", () => {
  socket.emit("stopTyping");
});

function send() {
  const msg = msgInput.value;
  if (!msg) return;
  socket.emit("send-message", { name, msg });
  msgInput.value = "";
  socket.emit("stopTyping");
}

socket.on("receive-message", data => {
  const div = document.createElement("div");
  div.innerText = `${data.name}: ${data.msg}`;
  document.getElementById("messages").appendChild(div);
});

socket.on("typing", (n) => {
  document.getElementById("typing").innerText = n + " typing...";
});

socket.on("stopTyping", () => {
  document.getElementById("typing").innerText = "";
});

socket.on("online-users", users => {
  document.getElementById("users").innerText =
    "Online: " + users.map(u => u.name).join(", ");
});

// ===== voice message =====
function recordVoice() {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    audioChunks = [];

    mediaRecorder.ondataavailable = e => {
      audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      const reader = new FileReader();
      reader.onloadend = () => {
        socket.emit("send-voice", { name, audio: reader.result });
      };
      reader.readAsDataURL(blob);
    };

    setTimeout(() => mediaRecorder.stop(), 3000);
  });
}

socket.on("receive-voice", data => {
  const audio = document.createElement("audio");
  audio.controls = true;
  audio.src = data.audio;
  document.getElementById("messages").appendChild(audio);
});
