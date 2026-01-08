const socket = io();

const my = localStorage.getItem("name");
const to = localStorage.getItem("toName");

h.innerText = to;
      

/* ---------- TEXT MESSAGE ---------- */
function sendMsg(){
  if(!msg.value.trim()) return;

  socket.emit("private-msg", {
    from: my,
    to,
    msg: msg.value,
    type: "text"
  });

  add("me", msg.value);
  msg.value = "";
}

msg.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMsg();
  }
});

/* ---------- VOICE MESSAGE (FIXED) ---------- */
let recorder, stream, chunks = [], recording = false;

mic.onclick = async () => {
  if (!recording) {
    chunks = [];
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(stream);
    recorder.start();
    recording = true;
    mic.innerText = "⏹";

    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunks.push(e.data);
    };
  } else {
    recorder.stop();
    recording = false;
    mic.innerText = "🎤";

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      if (blob.size < 1000) return;

      const r = new FileReader();
      r.onload = () => {
        socket.emit("voice", {
          from: my,
          to,
          audio: r.result
        });
      };
      r.readAsDataURL(blob);
      stream.getTracks().forEach(t => t.stop());
    };
  }
};

/* ---------- RECEIVE ---------- */
socket.on("private-msg", data => {
  add("other", data.msg);
  socket.emit("seen", data.from);
});

socket.on("voice", data => {
  const a = document.createElement("audio");
  a.src = data.audio;
  a.controls = true;
  chat.appendChild(a);
  chat.scrollTop = chat.scrollHeight;
});

socket.on("seen", () => {
  seen.innerText = "✔✔ Seen";
});

/* ---------- UI ---------- */
function add(cls, text) {
  const d = document.createElement("div");
  d.className = "msg " + cls;
  d.innerText = text;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}
