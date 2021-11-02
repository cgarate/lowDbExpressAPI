const express = require("express");
const lowDb = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const { nanoid } = require("nanoid");
const cors = require("cors");

const db = lowDb(new FileSync("db.json"));
const usersData = [
  { name: "Quagmire", id: 1, lastGameSession: 1 },
  { name: "Peter", id: 2, lastGameSession: 2 },
  { name: "Megan", id: 3, lastGameSession: 3 },
  { name: "Brian", id: 4, lastGameSession: 1 },
  { name: "Stewie", id: 5, lastGameSession: 1 },
  { name: "Chris", id: 6, lastGameSession: 2 },
  { name: "Louise", id: 7, lastGameSession: 4 },
];

const reviewsData = [
  {
    rating: "4",
    comments: "Delightful!",
    sessionId: 1,
    userId: 5,
    userName: "Stewie",
    id: "N1K5sWEPLi5o2ybe7s4B_",
  },
  {
    rating: "5",
    comments: "I guess it was good, I was drunk!",
    sessionId: 1,
    userId: 4,
    userName: "Brian",
    id: "LlvrPFF1qH1RWgGGRAriI",
  },
  {
    rating: "2",
    comments: "Not lit enough!",
    sessionId: 3,
    userId: 3,
    userName: "Megan",
    id: "Azm-Gu4VqAdWfCs97cqsZ",
  },
  {
    rating: "5",
    comments: "Loved It!",
    sessionId: 2,
    userId: 6,
    userName: "Chris",
    id: "3iBDgly3mLL3xaJm-XK2c",
  },
  {
    rating: "2",
    comments: "Extremely entertaining!",
    sessionId: 4,
    userId: 7,
    userName: "Louise",
    id: "YIS3Sho-g8JlWdAXIdccI",
  },
];

// Set default data
db.defaultsDeep({ reviews: reviewsData, users: usersData }).write();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const PORT = 3000;

// GET reviews
app.get("/reviews", (req, res) => {
  const { query } = req;
  const { ratingFilter } = query;

  const data = db.get("reviews").value();
  if (ratingFilter) {
    return res.json(
      data.filter((review) => Number(review.rating) === Number(ratingFilter)),
    );
  } else {
    return res.json(data)
  }
});

// GET users
app.get("/users", (_, res) => {
  const users = db.get("users").value();
  return res.json(users);
});


// POST reviews
app.post("/reviews/new", (req, res) => {
  const review = req.body;
  const { sessionId, userId } = review;
  const reviewId = nanoid();

  const reviewDataObject = db.get("reviews");
  const reviews = reviewDataObject.value();

  const userHasReviewedSession = reviews.some(
    (review) => review.sessionId === sessionId && review.userId === userId,
  );

  if (!userHasReviewedSession) {
    reviewDataObject
      .push({
        ...review,
        id: reviewId,
      })
      .write();
    res.json({ success: true, reviewId });
  } else {
    res.sendStatus(405);
  }
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
