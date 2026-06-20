const express = require('express');
const jwt = require('jsonwebtoken');
const regd_users = express.Router();

let books = require("./booksdb.js");

// Shared list of registered users. Exported so general.js can register
// new users into the same array.
let users = [];

// Returns true when the username is non-empty and not already taken.
const isValid = (username) => {
  if (!username) return false;
  return !users.some((user) => user.username === username);
};

// Returns true when a user with the given username AND password exists.
const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

// Task 7: Login as a registered user.
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid login. Check username and password." });
  }

  // Sign a JWT and store it (plus the username) in the session.
  const accessToken = jwt.sign({ data: username }, "access", { expiresIn: 60 * 60 });
  req.session.authorization = { accessToken, username };

  return res.status(200).json({ message: "User successfully logged in." });
});

// Task 8: Add or modify a book review for the logged-in user.
// The review is keyed by username, so re-submitting updates the existing one.
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }
  if (!review) {
    return res.status(400).json({ message: "A 'review' query parameter is required." });
  }

  const isUpdate = Object.prototype.hasOwnProperty.call(books[isbn].reviews, username);
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: isUpdate
      ? `Review for ISBN ${isbn} updated by user ${username}.`
      : `Review for ISBN ${isbn} added by user ${username}.`,
    reviews: books[isbn].reviews,
  });
});

// Task 9: Delete the review added by the logged-in user for a given ISBN.
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }

  if (!Object.prototype.hasOwnProperty.call(books[isbn].reviews, username)) {
    return res.status(404).json({ message: `No review by user ${username} for ISBN ${isbn}.` });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: `Review for ISBN ${isbn} deleted by user ${username}.`,
    reviews: books[isbn].reviews,
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
