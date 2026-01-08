const socket = io();
const my = localStorage.getItem("name");
const to = localStorage.getItem("toName");

h.innerText = to;
socket.emit("join", my);

function sendMsg(){
  if(!msg.value.trim()) return;

  socket.emit("private-msg", {
    from: my,
    to,
    msg: msg.value,
    type:"text"
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

socket.on("private-msg", data=>{
  if(data.type==="text"){
    add("other", data.msg);
    socket.emit("seen", data.from);
  }
});

socket.on("seen", ()=>{
  seen.innerText="✔✔ Seen";
});

function add(cls,text){
  const d=document.createElement("div");
  d.className="msg "+cls;
  d.innerText=text;
  chat.appendChild(d);
  chat.scrollTop=chat.scrollHeight;
}

/* 🎤 VOICE */
let rec, chunks=[];
async function record(){
  const s = await navigator.mediaDevices.getUserMedia({audio:true});
  rec = new MediaRecorder(s);
  rec.start();
  rec.ondataavailable=e=>chunks.push(e.data);
  setTimeout(()=>{
    rec.stop();
    rec.onstop=()=>{
      const blob=new Blob(chunks,{type:"audio/webm"});
      const reader=new FileReader();
      reader.onload=()=>{
        socket.emit("voice",{to,from:my,audio:reader.result});
      };
      reader.readAsDataURL(blob);
      chunks=[];
    };
  },3000);
}

socket.on("voice", data=>{
  const a=document.createElement("audio");
  a.src=data.audio;
  a.controls=true;
  chat.appendChild(a);
});
