import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const port = 3005;
const app = express();
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "root123",
  port: 5432,
});
db.connect();
//middleware and bodyparser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.listen(port, () => {
  console.log("Server started on port " + port);
});

var currentQuestion;
var userScore;
var randomIndex;
var appearedQuestions = [];
let quiz = [
  { region: "India", capital: "New Delhi" },
  { region: "Russia", capital: "Moscow" },
  { region: "Nepal", capital: "Kathmandu" },
];
db.query("SELECT * FROM stateutcapital", (err, res) => {
  if (err) {
    console.log("db error: " + err.stack);
  } else {
    quiz = res.rows;
  }
  db.end();
});
app.get("/", (req, res) => {
  // nextQuestion();
  refresh();
  userScore = 0;
  res.render("index.ejs", { question: currentQuestion, score: userScore });
});
app.post("/submit", (req, res) => {
  console.log(req.body);
  var userAnswer = req.body.answer;
  var ansCorrect = false;
  if (userAnswer.toLowerCase() === currentQuestion.capital.toLowerCase()) {
    console.log("correct");
    userScore++;
    ansCorrect = true;
  }
  appearedQuestions.push(randomIndex);
  if (appearedQuestions.length === quiz.length) {
    if (ansCorrect) {
      console.log("Length equals");
      console.log("Completed");
      res.render("index.ejs", {
        question: currentQuestion,
        score: userScore,
        completed: "true",
      });
    } else {
      res.render("index.ejs", {
        question: currentQuestion,
        score: userScore,
        isCorrect: ansCorrect,
      });
    }
  } else {
    nextQuestion(res);

    res.render("index.ejs", {
      question: currentQuestion,
      score: userScore,
      isCorrect: ansCorrect,
    });
  }
});
function refresh() {
  appearedQuestions = [];
  randomIndex = Math.floor(Math.random() * quiz.length);
  currentQuestion = quiz[randomIndex];
}
function nextQuestion(res) {
  randomIndex = Math.floor(Math.random() * quiz.length);
  while (appearedQuestions.includes(randomIndex)) {
    randomIndex = Math.floor(Math.random() * quiz.length);
  }
  currentQuestion = quiz[randomIndex];
}
