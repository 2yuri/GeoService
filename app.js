require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(require("./src/routes"));

app.listen(process.env.PORT || 3008, () => {
  console.log(`🚀 Server running on port: ${process.env.PORT}`);
});
