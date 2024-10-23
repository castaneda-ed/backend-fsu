require("dotenv").config();

const express = require("express");
const app = express();
const PORT = 3000;

//cors
const cors = require("cors");
app.use(cors({ origin: /localhost/ }));

app.use(require("morgan")("dev"));
app.use(express.json());

//Endpoints imports
app.use(require("./api/auth").router);
app.use("/departments", require("./api/department"));
app.use("/faculty", require("./api/faculty"));

// First Error handlers middleware
app.use((req, res, next) => {
  next({ status: 404, message: "Endpoint not found" });
});

// Second Error handlers middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status ?? 500);
  res.json(err.message ?? "Sorry, something went bad:(");
});

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}...`);
});
