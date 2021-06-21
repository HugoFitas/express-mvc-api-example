const connection = require("./db-config");
const express = require("express");
const app = express();

const port = process.env.PORT || 5000;

const moviesRouter = require("./routes/movies.route");
const usersRouter = require("./routes/users.route");

connection.connect((err) => {
  if (err) {
    console.error("error connecting: " + err.stack);
  } else {
    console.log("connected as id " + connection.threadId);
  }
});

app.use(express.json());

app.use("/api/movies", moviesRouter);
app.use("/api/users", usersRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
