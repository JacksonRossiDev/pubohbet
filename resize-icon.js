// resize-icon.js
const sharp = require("sharp");

sharp("./assets/ohbet-icon-final.png")
  .resize(1024, 1024)
  .flatten({ background: "#87ceeb" }) // light blue background
  .toFile("./assets/icon.png")
  .then(() => {
    console.log("✅ icon.png created successfully");
  })
  .catch(err => {
    console.error("❌ Error processing image:", err);
  });