const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  "/generated",
  express.static("generated")
);

app.use(
  "/api/questions",
  require("./routes/questionRoutes")
);

app.listen(5000, () => {
  console.log("Server running on 5000");
});