const express = require("express");
const app = express();

app.use(express.json());

// static files serve करने के लिए
app.use(express.static("public"));

app.post("/api/location", (req, res) => {
  const { lat, lon, acc } = req.body;

  if (!lat || !lon) {
    return res.sendStatus(400);
  }

  const mapLink = `https://www.google.com/maps?q=${lat},${lon}`;

  console.log("📍 New Location Received");
  console.log("Latitude :", lat);
  console.log("Longitude:", lon);
  console.log("Accuracy :", acc, "meters");
  console.log("🗺️ Map Link:", mapLink);
  console.log("--------------------------------");

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
