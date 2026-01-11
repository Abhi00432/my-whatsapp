const socket = io();
const me = JSON.parse(localStorage.getItem("user"));
const list = document.getElementById("list");

function post() {
  const text = document.getElementById("text").value;
  const img = document.getElementById("img").files[0];

  const reader = new FileReader();
  reader.onload = () => {
    socket.emit("status", {
      room: me.room,
      name: me.name,
      text,
      img: reader.result,
      time: Date.now()
    });
  };
  if (img) reader.readAsDataURL(img);
}

socket.on("status", data => {
  const div = document.createElement("div");
  div.className = "status";
  div.innerHTML = `
    <b>${data.name}</b>
    <p>${data.text}</p>
    ${data.img ? `<img src="${data.img}">` : ""}
  `;
  list.appendChild(div);

  // auto delete after 24h
  setTimeout(() => div.remove(), 86400000);
});
      