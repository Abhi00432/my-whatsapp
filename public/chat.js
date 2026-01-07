const socket = io();
const name = localStorage.getItem("username");
const dp = localStorage.getItem("dp");
const to = new URLSearchParams(location.search).get("user");
if (!name || !to) location.href = "/chats.html";

chatWith.innerText = to;
socket.emit("join", { name });

msg.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMsg();
  socket.emit("typing", { to, from: name });
});

function sendMsg() {
  if (!msg.value.trim()) return;
  add(name, msg.value, "me");
  socket.emit("private-msg", { to, from: name, msg: msg.value });
  msg.value = "";
}

socket.on("private-msg", d => add(d.from, d.msg, "other"));

/* IMAGE */
photo.onchange = e => {
  const r = new FileReader();
  r.onload = () => socket.emit("private-image", { to, from: name, img: r.result });
  r.readAsDataURL(e.target.files[0]);
};
socket.on("private-image", d => {
  const i = document.createElement("img");
  i.src = d.img; i.style.maxWidth = "150px";
  messages.appendChild(i);
});

/* VOICE MESSAGE */
let rec, chunks = [];
navigator.mediaDevices.getUserMedia({ audio: true }).then(s => {
  rec = new MediaRecorder(s);
  rec.ondataavailable = e => chunks.push(e.data);
  rec.onstop = () => {
    const r = new FileReader();
    r.onload = () => socket.emit("private-voice", { to, from: name, audio: r.result });
    r.readAsDataURL(new Blob(chunks, { type: "audio/webm" }));
    chunks = [];
  };
});
function startVoice() { rec.start() }
function stopVoice() { rec.stop() }
socket.on("private-voice", d => {
  const a = document.createElement("audio");
  a.controls = true; a.src = d.audio;
  messages.appendChild(a);
});

/* VOICE CALL (basic) */
let pc;
function startCall() {
  pc = new RTCPeerConnection();
  navigator.mediaDevices.getUserMedia({ audio: true }).then(s => {
    s.getTracks().forEach(t => pc.addTrack(t, s));
  });
  pc.onicecandidate = e => {
    e.candidate && socket.emit("call-ice", { to, from: name, candidate: e.candidate });
  };
  pc.createOffer().then(o => {
    pc.setLocalDescription(o);
    socket.emit("call-offer", { to, from: name, offer: o });
  });
}
socket.on("call-offer", d => {
  pc = new RTCPeerConnection();
  pc.setRemoteDescription(d.offer);
  pc.createAnswer().then(a => {
    pc.setLocalDescription(a);
    socket.emit("call-answer", { to: d.from, answer: a });
  });
});
socket.on("call-answer", d => pc.setRemoteDescription(d.answer));
socket.on("call-ice", d => pc.addIceCandidate(d.candidate));

function add(u, m, t) {
  const d = document.createElement("div");
  d.className = "msg " + t;
  d.innerHTML = `<b>${u}</b><br>${m}`;
  messages.appendChild(d);
}
