import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import session from 'express-session';
import bodyParser from 'body-parser';
const PORT = 3000;
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.set('views', path.join(__dirname, '/public/views'));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Make sure this is before your routes
const sessionMiddleware = session({
  secret: "34t3wgghrthr3wtbhrewbhrwh24hrh",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
})
app.use(sessionMiddleware);
app.get("/", (req, res) => {
  console.log("e")
  if (req.session.amount) {
    return res.redirect("/game?amount="+req.session.amount)
  }
  res.render("main");
});

app.get("/start", (req, res) => {
  return res.redirect("/game?amount="+(req.query.amount ? req.query.amount : 50));
});

app.get("/game", (req, res) => {
  res.render("game", {amount: (req.query.amount ? req.query.amount : 50)});
});

app.listen(PORT, () => {
  console.log("listening on port " + PORT);
});

