const express = require("express");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;
const legoData = require("./modules/legoSets");

// static files folder
app.use(express.static("public"));

// ejs
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/lego/sets", (req, res) => {
  if (req.query.theme) {
    legoData
      .getSetsByTheme(req.query.theme)
      .then((sets) => res.render("sets", { sets }))
      .catch((err) => {
        res.status(404).render("404", { message: err });
      });
  } else {
    legoData
      .getAllSets()
      .then((sets) => res.render("sets", { sets }))
      .catch((err) => {
        res.status(404).render("404", { message: err });
      });
  }
});

app.get("/lego/sets/:setNum", (req, res) => {
  legoData
    .getSetByNum(req.params.setNum)
    .then((set) => {
      res.render("set", { set });
    })
    .catch((err) => {
      res.status(404).render("404", { message: err });
    });
});

// 404 error
app.use((req, res) => {
  res.status(404).render("404", {
    message: "I'm sorry, we're unable to find what you're looking for",
  });
});

legoData
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, () =>
      console.log(`server listening on: ${HTTP_PORT}`)
    );
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
