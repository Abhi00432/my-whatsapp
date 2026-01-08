const socket = io();

const my = localStorage.getItem("name");
const to = localStorage.getItem("toName");

h.innerText = to;
socket.emit("join", my);

/* ---------- TEXT MSG ---------- */
function sendMsg(){
  if(!msg.value.trim()) return;

  socket.emit("private-msg", {
    from: my,
    to,
    msg: msg.value,
    type: "text"
  });

  add("me", msg.value);
  msg.value="";
}

msg.addEventListener("keydown", e=>{
  if(e.key==="Enter"){
    e.preventDefault();
    sendMsg();
  }
});

/* ---------- VOICE MSG (FIXED) ---------- */
let mediaRecorder;
let audioChunks = [];
let stream;

const micBtn = document.getElementById("mic");

micBtn.addEventListener("mousedown", startRecord);
micBtn.addEventListener("touchstart", startRecord);

micBtn.addEventListener("mouseup", stopRecord);
micBtn.addEventListener("touchend", stopRecord);

async function startRecord(){
  audioChunks = [];
  stream = await navigator.mediaDevices.getUserMedia({ audio:true });

  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.start();

  mediaRecorder.ondataavailable = e => {
    if(e.data.size > 0) audioChunks.push(e.data);
  };
}

function stopRecord(){
  if(!mediaRecorder) return;

  mediaRecorder.stop();

  mediaRecorder.onstop = () => {
    const blob = new Blob(audioChunks, { type:"audio/webm" });
    if(blob.size < 1000) return; // ❌ empty audio block

    const reader = new FileReader();
    reader.onload = () => {
      socket.emit("voice", {
        from: my,
        to,
        audio: reader.result
      });
    };
    reader.readAsDataURL(blob);

    stream.getTracks().forEach(t=>t.stop());
  };
}

/* ---------- RECEIVE ---------- */
socket.on("private-msg", data=>{
  add("other", data.msg);
  socket.emit("seen", data.from);
});

socket.on("voice", data=>{
  const a = document.createElement("audio");
  a.src = data.audio;
  a.controls = true;
  chat.appendChild(a);
  chat.scrollTop = chat.scrollHeight;
});

socket.on("seen", ()=>{
  seen.innerText="✔✔ Seen";
});

/* ---------- UI ---------- */
function add(cls,text){
  const d=document.createElement("div");
  d.className="msg "+cls;
  d.innerText=text;
  chat.appendChild(d);
  chat.scrollTop=chat.scrollHeight;
}
