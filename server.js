/********************************************************************************
 * WEB322 – Assignment 04
 *
 * I declare that this assignment is my own work in accordance with Seneca's
 * Academic Integrity Policy:
 *
 * https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
 * Name: Palak Arora_ Student ID: ____159493212___ Date: _09-11-2023__
 *
 * Published URL: https://frantic-tweed-jacket-bass.cyclic.app
 *
 ********************************************************************************/
const express = require("express");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;
const legoData = require("./modules/legoSets");

// static files folder
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

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

app.get("/lego/addSet", (req, res) => {
  legoData
    .getAllThemes()
    .then((themeData) => res.render("addSet", { themes: themeData }))
    .catch((err) => {
      res.render("addSet", { message: err, themes: [] });
    });
});

app.post("/lego/addSet", (req, res) => {
  legoData
    .addSet(req.body)
    .then(() => res.redirect("/lego/sets"))
    .catch((err) => {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
      });
    });
});

app.get("/lego/editSet/:setNum", (req, res) => {
  legoData
    .getSetByNum(req.params.setNum)
    .then((setData) => {
      legoData
        .getAllThemes()
        .then((themeData) =>
          res.render("editSet", { themes: themeData, set: setData })
        )
        .catch((err) => {
          res.status(404).render("404", { message: err });
        });
    })
    .catch((err) => {
      res.status(404).render("404", { message: err });
    });
});

app.post("/lego/editSet/:num", (req, res) => {
  legoData
    .editSet(req.params.num, req.body)
    .then(() => res.redirect("/lego/sets"))
    .catch((err) => {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
      });
    });
});

app.get("/lego/deleteSet/:num", (req, res) => {
  legoData
    .deleteSet(req.params.num)
    .then(() => res.redirect("/lego/sets"))
    .catch((err) => {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
      });
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
