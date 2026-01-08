const socket = io();

const my = localStorage.getItem("name");
const to = localStorage.getItem("toName");

h.innerText = to;
socket.emit("join", my);

/* TEXT */
function sendMsg() {
  if (!msg.value.trim()) return;
  socket.emit("private-msg", { from: my, to, msg: msg.value, type: "text" });
  add("me", msg.value);
  msg.value = "";
}

msg.addEventListener("keydown", e => {
  if (e.key === "Enter") { e.preventDefault(); sendMsg(); }
});

/* 🎤 VOICE (CLICK START / STOP) */
let recorder, stream, chunks = [], recording = false;

mic.onclick = async () => {
  if (!recording) {
    chunks = [];
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(stream, { mimeType: "audio/mp4" });
    recorder.start();
    recording = true;
    mic.innerText = "⏹";
    recorder.ondataavailable = e => chunks.push(e.data);
  } else {
    recorder.stop();
    recording = false;
    mic.innerText = "🎤";
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/mp4" });
      const r = new FileReader();
      r.onload = () => {
        socket.emit("voice", { from: my, to, audio: r.result });
      };
      r.readAsDataURL(blob);
      stream.getTracks().forEach(t => t.stop());
    };
  }
};

/* RECEIVE */
socket.on("private-msg", d => add("other", d.msg));
socket.on("voice", d => {
  const a = document.createElement("audio");
  a.src = d.audio;
  a.controls = true;
  chat.appendChild(a);
  chat.scrollTop = chat.scrollHeight;
});

function add(c, t) {
  const d = document.createElement("div");
  d.className = "msg " + c;
  d.innerText = t;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}
