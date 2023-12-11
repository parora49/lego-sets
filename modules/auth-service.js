require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// schema
const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    unique: true,
  },
  password: { type: String },
  email: { type: String },
  loginHistory: [
    {
      dateTime: { type: Date },
      userAgent: { type: String },
    },
  ],
});

let User;

// initialize db and User
function initialize() {
  return new Promise(function (resolve, reject) {
    const db = mongoose.createConnection(
      "mongodb+srv://web322:Web322@cluster0.2lmc9av.mongodb.net/web322?retryWrites=true&w=majority"
    );

    db.on("error", (err) => {
      reject(err);
    });
    db.once("open", () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
}

// register a new user
function registerUser(userData) {
  return new Promise(function (resolve, reject) {
    if (userData.password !== userData.password2) {
      reject("Passwords do not match");
    } else {
      bcrypt
        .hash(userData.password, 10)
        .then((hash) => {
          userData.password = hash;

          User.create(userData)
            .then(() => {
              resolve();
            })
            .catch((err) => {
              if (err.code === 11000) {
                reject("User Name already taken");
              } else {
                reject(`There was an error creating the user: ${err}`);
              }
            });
        })
        .catch(() => {
          reject("Error occurred while encrypting the password");
        });
    }
  });
}

// checks if user exists
function checkUser(userData) {
  return new Promise(function (resolve, reject) {
    User.find({ userName: userData.userName })
      .then((users) => {
        if (users.length === 0) {
          // no users found
          reject(`Unable to find user: ${userData.userName}`);
        } else {
          bcrypt
            .compare(userData.password, users[0].password) // compare passwords
            .then((result) => {
              if (result === true) {
                // check history
                if (users[0].loginHistory.length == 8) {
                  users[0].loginHistory.pop(); // remove the last item
                }

                // add new history at the front
                users[0].loginHistory.unshift({
                  dateTime: new Date().toString(),
                  userAgent: userData.userAgent,
                });

                User.updateOne(
                  { userName: users[0].userName },
                  {
                    $set: {
                      loginHistory: users[0].loginHistory,
                    },
                  }
                )
                  .then(() => resolve(users[0]))
                  .catch((err) => {
                    reject(`There was an error verifying the user: ${err}`);
                  });
              } else {
                // password don't match
                reject(`Incorrect Password for user: ${userData.userName}`);
              }
            });
        }
      })
      .catch((err) => {
        reject(`There was an error finding the user: ${err}`);
      });
  });
}

module.exports = {
  initialize,
  registerUser,
  checkUser,
};
