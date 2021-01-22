# Hello!

This is the page where I demonstrate some sample code, take for example the server file for this blog:

```js
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
```

Tadaa!
