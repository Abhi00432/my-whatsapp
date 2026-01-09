const socket = io();

const my = localStorage.getItem("name");
const to = localStorage.getItem("toName");

h.innerText = to;

/* ================= TEXT MESSAGE ================= */

function sendMsg() {
  if (!msg.value.trim()) return;

  socket.emit("private-msg", {
    from: my,
    to,
    msg: msg.value
  });

  add("me", msg.value);
  msg.value = "";
}

msg.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMsg();
  } else {
    socket.emit("typing", to);
  }
});

/* ================= VOICE MESSAGE (FINAL FIX) ================= */

let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let stream = null;

// Detect supported mime type
function getMimeType() {
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus"))
    return "audio/webm;codecs=opus";
  if (MediaRecorder.isTypeSupported("audio/webm"))
    return "audio/webm";
  return "";
}

mic.addEventListener("click", async () => {
  // START RECORD
  if (!isRecording) {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      alert("Microphone permission denied");
      return;
    }

    audioChunks = [];
    const mimeType = getMimeType();
    mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});

    mediaRecorder.start();
    isRecording = true;
    mic.innerText = "⏹";

    mediaRecorder.ondataavailable = e => {
      if (e.data && e.data.size > 0) {
        audioChunks.push(e.data);
      }
    };

  }
  // STOP RECORD
  else {
    mediaRecorder.stop();
    isRecording = false;
    mic.innerText = "🎤";

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, {
        type: mediaRecorder.mimeType || "audio/webm"
      });

      if (blob.size < 1000) {
        console.log("Empty audio ignored");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        socket.emit("voice", {
          from: my,
          to,
          audio: reader.result
        });
      };
      reader.readAsDataURL(blob);

      if (stream) {
        stream.getTracks().forEach(t => t.stop());
        stream = null;
      }
    };
  }
});

/* ================= RECEIVE ================= */

socket.on("private-msg", data => {
  add("other", data.msg);
});

socket.on("voice", data => {
  const audio = document.createElement("audio");
  audio.src = data.audio;
  audio.controls = true;
  chat.appendChild(audio);
  chat.scrollTop = chat.scrollHeight;
});

socket.on("typing", () => {
  typing.style.display = "block";
  clearTimeout(window.t);
  window.t = setTimeout(() => {
    typing.style.display = "none";
  }, 800);
});

/* ================= UI ================= */

function add(cls, text) {
  const d = document.createElement("div");
  d.className = "msg " + cls;
  d.innerText = text;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}
