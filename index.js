import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import flash from "connect-flash";
import { connect, initDB } from "./db.js";

const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: "your-secret", resave: false, saveUninitialized: true }));
app.use(flash());
app.use(express.json());

// Route untuk halaman utama (login) DONE
app.get("/", (req, res) => {
  res.render("index.ejs", { error: req.flash("error").length > 0 });
});

// Route untuk logout DONE
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send("Logout failed");
    }
    res.redirect("/");
  });
});

// Tangani POST dari form login DONE
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (username === "owner" && password === "password123") {
    res.redirect("/owner/dashboard");
  } else if (username === "owner" && password !== "password123") {
    req.flash("error", true);
    res.redirect("/");
  } else {
    try {
      const pool = connect(); // Ambil pool

      // MENGUBAH: Syntax query menggunakan ? dan array parameter
      const sqlQuery = "SELECT id_asisten, nama_asisten, password FROM Asisten WHERE nama_asisten = ?";
      const [rows] = await pool.execute(sqlQuery, [username]);

      // MENGUBAH: result.recordset menjadi rows
      if (rows.length == 0) {
        req.flash("error", true);
        res.redirect("/");
      } else {
        if (rows[0].password == password) {
          req.session.assistantName = username;
          req.session.idAsisten = rows[0].id_asisten;
          res.redirect("/assistant/dashboard");
        } else {
          res.render("index.ejs", { error: true });
        }
      }
    } catch (err) {
      console.log(err.message);
    }
  }
});

// ------------------------ ASSISTANT INTERFACE -------------------------

// Route untuk halaman dashboard client DONE
app.get("/assistant/dashboard", (req, res) => {
  res.render("dashboardass.ejs", {
    title: "Dashboard Assistant",
    name: req.session.assistantName,
    active: 1,
  });
});

// --------------------------- OWNER INTERFACE ------------------------------

// Route untuk ke dashboard / home owner DONE
app.get("/owner/dashboard", (req, res) => {
  res.render("dashboardowner.ejs", {
    title: "Dashboard Owner",
    active: 1,
  });
});

// Inisialisasi Database
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server berjalan di http://localhost:${PORT}`);
    });
});