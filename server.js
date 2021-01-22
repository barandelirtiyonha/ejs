// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const fs = require("fs");
const marked = require("marked");
const bodyParser = require("body-parser");

// init sqlite db
const dbFile = "./.data/sqlite.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);

//create a database if it doesn't exist yet

db.serialize(() => {
  if (!exists) {
    db.run(
      "CREATE TABLE Replies (id INTEGER PRIMARY KEY AUTOINCREMENT, post TEXT, body TEXT NOT NULL, author TEXT)"
    );
  }
});

marked.setOptions({
  highlight: function(code, language) {
    const hljs = require("highlight.js");
    const validLanguage = hljs.getLanguage(language) ? language : "plaintext";
    return hljs.highlight(validLanguage, code).value;
  }
});

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

app.get("/", (request, response) => {
  const input = fs.readFileSync(__dirname + "/README.md").toString();
  response.render(__dirname + "/views/index.ejs", {
    urls: fs.readdirSync(__dirname + "/posts"),
    mainPost: marked(input)
  });
});

app.get("/:article", (req, res) => {
  const input = fs
    .readFileSync(__dirname + "/posts/" + req.params.article)
    .toString();
  db.all(
    "SELECT * FROM Replies WHERE post=?",
    [req.params.article],
    (err, rows) => {
      res.render(__dirname + "/views/post.ejs", {
        post: marked(input),
        urls: fs.readdirSync(__dirname + "/posts"),
        replies: rows
      });
    }
  );
});

app.post("/:article", (req, res) => {
  const formBody = req.body;
  const article = req.params.article;
  db.run(
    "INSERT INTO Replies (post, author, body) VALUES (?, ?, ?)",
    [article, formBody.author, formBody.reply],
    error => {
      if (error) {
        console.log(error);
        res.send(500, error);
      } else {
        res.redirect("back");
      }
    }
  );
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
