/********************************************************************************
 *  WEB322 – Assignment 06
 *
 *  I declare that this assignment is my own work in accordance with Seneca's
 *  Academic Integrity Policy:
 *
 *  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
 *  Name: Palak Arora_ Student ID: ____159493212___ Date: _05-12-2023__
 *
 *  Published URL: https://frantic-tweed-jacket-bass.cyclic.app
 *
 ********************************************************************************/

const authData = require("./modules/auth-service");
const express = require("express");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;
const legoData = require("./modules/legoSets");
const clientSessions = require("client-sessions");

// static files folder
app.use(express.static("public"));app.use(express.urlencoded({ extended: true }));


// sesssion
app.use(
  clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "j6PjQ4DfqzEVNf6GgAHE6hd69Nh6hG7SJ8QZz", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute)
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

//helper middleware function that checks if a user is logged in 
function ensureLogin(req, res, next) {
  if (!req.session.user){
    res.redirect('/login');
  } else {
    next();
  }
}

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
 
app.get("/lego/addSet",  ensureLogin,(req, res) => {
  legoData
    .getAllThemes()
    .then((themeData) => res.render("addSet", { themes: themeData }))
    .catch((err) => {
      res.render("addSet", { message: err, themes: [] });
    });
});

app.post("/lego/addSet", ensureLogin, (req, res) => {
  legoData
    .addSet(req.body)
    .then(() => res.redirect("/lego/sets"))
    .catch((err) => {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
      });
    });
});

app.get("/lego/editSet/:setNum", ensureLogin, (req, res) => {
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

app.post("/lego/editSet/:num", ensureLogin, (req, res) => {
  legoData
    .editSet(req.params.num, req.body)
    .then(() => res.redirect("/lego/sets"))
    .catch((err) => {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
      });
    });
});

app.get("/lego/deleteSet/:num", ensureLogin, (req, res) => {
  legoData
    .deleteSet(req.params.num)
    .then(() => res.redirect("/lego/sets"))
    .catch((err) => {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
      });
    });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  authData
    .registerUser(req.body)
    .then(() => {
      res.render("register", { successMessage: "User created" });
    })
    .catch((err) => {
      res.render("register", {
        errorMessage: err,
        userName: req.body.userName,
      });
    });
});

app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent");

  authData
    .checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
      };
      res.redirect("/lego/sets");
    })
    .catch((err) => {
      res.render("login", {
        errorMessage: err,
        userName: req.body.userName,
      });
    });
});

// login history
app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory");
});

// logout route
app.get("/logout", function (req, res) {
  delete app.locals["session"];
  req.session.reset();
  res.redirect("/");
});
// 404 error
app.use((req, res) => {
  res.status(404).render("404", {
    message: "I'm sorry, we're unable to find what you're looking for",
  });
});

legoData
  .initialize()
  .then(authData.initialize)
  .then(() => {
    app.listen(HTTP_PORT, () =>
      console.log(`server listening on: ${HTTP_PORT}`)
    );
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
