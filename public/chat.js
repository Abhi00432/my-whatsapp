const socket = io();

const name = localStorage.getItem("username");
if (!name) location.href = "/";

let currentUser = null;

socket.emit("join", { name });

const usersDiv = document.getElementById("users");
const messages = document.getElementById("messages");
const msgInput = document.getElementById("msg");
const typingEl = document.getElementById("typing");
const photoInput = document.getElementById("photo");

/* ================= USERS LIST ================= */
socket.on("users-list", (list) => {
  usersDiv.innerHTML = "";
  list.filter(u => u !== name).forEach(u => {
    const div = document.createElement("div");
    div.className = "user";
    div.innerText = u;
    div.onclick = () => {
      currentUser = u;
      messages.innerHTML = "";
      document.getElementById("chatWith").innerText = u;
    };
    usersDiv.appendChild(div);
  });
});

/* ================= SEND TEXT ================= */
function sendMsg() {
  if (!currentUser) return alert("Select user first");

  const msg = msgInput.value.trim();
  if (msg === "") return;

  addMsg(name, msg, "me");

  socket.emit("private-msg", {
    to: currentUser,
    from: name,
    msg
  });

  msgInput.value = "";
}

/* ================= ENTER PRESS FIX ================= */
msgInput.addEventListener("keydown", (e) => {

  // SHIFT + ENTER = new line
  if (e.key === "Enter" && e.shiftKey) {
    return;
  }

  // ENTER = send
  if (e.key === "Enter") {
    e.preventDefault();
    sendMsg();
  } else {
    // typing indicator only on real typing
    if (currentUser) {
      socket.emit("typing", { to: currentUser, from: name });
    }
  }
});

/* ================= RECEIVE TEXT ================= */
socket.on("private-msg", (data) => {
  addMsg(data.from, data.msg, "other");
});

/* ================= IMAGE ================= */
photoInput.onchange = (e) => {
  if (!currentUser) return alert("Select user first");

  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    socket.emit("private-image", {
      to: currentUser,
      from: name,
      img: reader.result
    });
  };
  reader.readAsDataURL(file);
};

socket.on("private-image", (d) => {
  const div = document.createElement("div");
  div.className = "msg other";
  div.innerHTML = `<b>${d.from}</b><br><img src="${d.img}" style="max-width:160px;border-radius:8px">`;
  messages.appendChild(div);
});

/* ================= VOICE MESSAGE ================= */
let recorder, chunks = [];

navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
  recorder = new MediaRecorder(stream);

  recorder.ondataavailable = e => chunks.push(e.data);

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "audio/webm" });
    chunks = [];

    const reader = new FileReader();
    reader.onload = () => {
      socket.emit("private-voice", {
        to: currentUser,
        from: name,
        audio: reader.result
      });
    };
    reader.readAsDataURL(blob);
  };
});

// Hold V to record voice
document.addEventListener("keydown", e => {
  if (e.key === "v" && recorder && recorder.state === "inactive") {
    recorder.start();
  }
});
document.addEventListener("keyup", e => {
  if (e.key === "v" && recorder && recorder.state === "recording") {
    recorder.stop();
  }
});

socket.on("private-voice", d => {
  const div = document.createElement("div");
  div.className = "msg other";
  div.innerHTML = `<b>${d.from}</b><br><audio controls src="${d.audio}"></audio>`;
  messages.appendChild(div);
});

/* ================= TYPING ================= */
socket.on("typing", u => {
  typingEl.innerText = u + " typing...";
  setTimeout(() => typingEl.innerText = "", 1000);
});

/* ================= UI HELPER ================= */
function addMsg(user, msg, type) {
  const d = document.createElement("div");
  d.className = "msg " + type;
  d.innerHTML = `<b>${user}</b><br>${msg}`;
  messages.appendChild(d);
  messages.scrollTop = messages.scrollHeight;
}
