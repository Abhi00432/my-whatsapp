const socket = io();
const me = localStorage.getItem("name");
socket.emit("join", me);

socket.on("status", data=>{
  list.innerHTML="";
  for(let u in data){
    list.innerHTML+=`
      <div>
        <b>${u}</b><br>
        <img src="${data[u]}" style="width:100%">
      </div>`;
  }
});

function addStatus(inp){
  const r=new FileReader();
  r.onload=()=>{
    socket.emit("add-status",{name:me,image:r.result});
  };
  r.readAsDataURL(inp.files[0]);
}
