const dpInput = document.getElementById("dp");
const preview = document.getElementById("preview");

dpInput.onchange = () => {
  const file = dpInput.files[0];
  if (file) {
    preview.src = URL.createObjectURL(file);
  }
};

function join() {
  const name = document.getElementById("name").value;
  const room = document.getElementById("room").value;
  const dp = preview.src;

  if (!name || !room) {
    alert("Fill all details");
    return;
  }

  localStorage.setItem("user", JSON.stringify({ name, dp, room }));
  window.location = "chat.html";
}
