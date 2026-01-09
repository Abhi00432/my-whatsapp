const socket=io();
const me=localStorage.getItem("name");
socket.emit("join",me);

function uploadStatus(inp){
  const r=new FileReader();
  r.onload=()=>socket.emit("add-status",{name:me,image:r.result});
  r.readAsDataURL(inp.files[0]);
}

socket.on("status",data=>{
  statusList.innerHTML="";
  for(let u in data){
    statusList.innerHTML+=`
    <div class="item">
      <div class="avatar status-ring">${u[0]}</div>
      <img src="${data[u]}" width="80">
    </div>`;
  }
});

function go(p){location.href=p}
