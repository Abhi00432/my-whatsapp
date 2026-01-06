const socket = io();

let myId = "";
let selectedUser = "";
let selectedName = "";

socket.on("connect", () => {
  myId = socket.id;
});

function join() {
  const name = document.getElementById("name").value;
  const file = document.getElementById("dp").files[0];
  if (!name || !file) return alert("Name & DP required");

  const reader = new FileReader();
  reader.onload = () => {
    socket.emit("join", { name, dp: reader.result });
    document.getElementById("login").style.display = "none";
    document.getElementById("chat").style.display = "flex";
  };
  reader.readAsDataURL(file);
}

// online users
socket.on("online-users", (users) => {
  const box = document.getElementById("users");
  box.innerHTML = "";

  for (let id in users) {
    if (id === myId) continue;

    const div = document.createElement("div");
    div.className = "user";
    div.innerHTML = `
      <img src="${users[id].dp}">
      <span>${users[id].name}</span>
    `;
    div.onclick = () => {
      selectedUser = id;
      selectedName = users[id].name;
      document.getElementById("header").innerText =
        "Chat with " + selectedName;
      document.getElementById("messages").innerHTML = "";
    };
    box.appendChild(div);
  }
});

// send message
const msgInput = document.getElementById("msg");

msgInput.addEventListener("keydown", (e) => {
  if (!selectedUser) return;
  socket.emit("typing", selectedUser);
  if (e.key === "Enter") {
    send();
  }
});

function send() {
  if (!msgInput.value || !selectedUser) return;
  socket.emit("private-message", {
    to: selectedUser,
    msg: msgInput.value
  });

  addMessage("You", msgInput.value);
  msgInput.value = "";
  socket.emit("stopTyping", selectedUser);
}

socket.on("receive-message", (data) => {
  addMessage(data.name, data.msg);
});

function addMessage(name, msg) {
  const div = document.createElement("div");
  div.innerText = name + ": " + msg;
  document.getElementById("messages").appendChild(div);
}

// typing
socket.on("typing", (name) => {
  document.getElementById("typing").innerText = name + " typing...";
});

socket.on("stopTyping", () => {
  document.getElementById("typing").innerText = "";
});
