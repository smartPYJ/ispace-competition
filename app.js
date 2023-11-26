require("dotenv").config();
const express = require("express");
const app = express();

const port = process.env.PORT;
const cookieParser = require("cookie-parser");
const sessions = require("express-session");

const DB = require("./config/database");

const oneDay = 1000 * 60 * 60 * 24;

// parsing the incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookie parser middleware
app.use(cookieParser());

app.use(
  sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767dontforgettoaddsmart",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false,
  })
);

//Static files
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

DB.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("MySQL connected!");
  }
});

// Registration

app.use(express.urlencoded({ extended: "false" }));
app.use(express.json());

app.post("/auth/register", (req, res) => {
  const { fName_reg, lName_reg, mName_reg, email_reg, grade_reg, password_reg, cPassword_reg, gender_reg } = req.body;

  DB.query(
    "SELECT email FROM users WHERE email = ?",
    [email],
    async (error, result) => {
      if (error) {
        console.log(error);
      }

      if (result.length > 0) {
        return res.render("register", {
          message: "This email is already in use",
        });
      } else if (password !== password_confirm) {
        return res.render("register", {
          message: "Password Didn't Match!",
        });
      }

      let hashedPassword = await bcrypt.hash(password, 8);

      console.log(hashedPassword);
      DB.query(
        "INSERT INTO users SET?",
        {
          first_name: fName_reg,
          last_name: lName_reg,
          other_name: mName_reg,
          email: email_reg,
          password: hashedPassword,
          grade: grade_reg,
          gender: gender_reg,
        },
        (err, result) => {
          if (error) {
          } else {
            return res.render("register", {
              message: "User registered!",
            });
          }
        }
      );
    }
  );
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

//session login
var session;

app.get("/dashboard", (req, res) => {
  session = req.session;
  if (session.userid) {
    res.send("Welcome User <a href='/logout'>click to logout</a>");
  } else res.render("login");
});

app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});

app.listen(port, () => {
  console.log(`Ispace  app listening at http://localhost:${port}`);
});
