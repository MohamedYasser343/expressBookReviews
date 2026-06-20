const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
const { isValid, users } = require("./auth_users.js");
const public_users = express.Router();

// Base URL of this running server, used by the Axios-based method below.
const BASE_URL = `http://localhost:${process.env.PORT || 5000}`;

// ---------------------------------------------------------------------------
// Task 6: Register a new user.
// ---------------------------------------------------------------------------
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (!isValid(username)) {
    return res.status(409).json({ message: `User ${username} already exists.` });
  }

  users.push({ username, password });
  return res.status(201).json({ message: `User ${username} successfully registered. You can now log in.` });
});

// Raw catalogue endpoint. Returns the full list of books directly from the
// in-memory database. It is the data source the Axios method below calls.
public_users.get('/books', (req, res) => {
  return res.status(200).json(books);
});

// ---------------------------------------------------------------------------
// Task 1 + Task 10: Get the list of all books.
// Implemented with async/await + Axios (Axios fetches the catalogue over HTTP).
// ---------------------------------------------------------------------------
public_users.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/books`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Unable to retrieve the book list." });
  }
});

// ---------------------------------------------------------------------------
// Task 2 + Task 11: Get book details based on ISBN.
// Implemented with Promise callbacks (.then / .catch).
// ---------------------------------------------------------------------------
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject(`Book with ISBN ${isbn} not found.`);
    }
  })
    .then((book) => res.status(200).json(book))
    .catch((message) => res.status(404).json({ message }));
});

// ---------------------------------------------------------------------------
// Task 3 + Task 12: Get all books by a given author.
// Implemented with Promise callbacks (.then / .catch).
// ---------------------------------------------------------------------------
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author;

  new Promise((resolve, reject) => {
    const matches = Object.keys(books)
      .filter((isbn) => books[isbn].author.toLowerCase() === author.toLowerCase())
      .map((isbn) => ({ isbn, ...books[isbn] }));

    if (matches.length > 0) {
      resolve(matches);
    } else {
      reject(`No books found for author ${author}.`);
    }
  })
    .then((matches) => res.status(200).json({ booksbyauthor: matches }))
    .catch((message) => res.status(404).json({ message }));
});

// ---------------------------------------------------------------------------
// Task 4 + Task 13: Get all books by a given title.
// Implemented with async/await over a Promise.
// ---------------------------------------------------------------------------
public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title;

  try {
    const getBooksByTitle = () =>
      new Promise((resolve) => {
        const matches = Object.keys(books)
          .filter((isbn) => books[isbn].title.toLowerCase() === title.toLowerCase())
          .map((isbn) => ({ isbn, ...books[isbn] }));
        resolve(matches);
      });

    const matches = await getBooksByTitle();
    if (matches.length > 0) {
      return res.status(200).json({ booksbytitle: matches });
    }
    return res.status(404).json({ message: `No books found with title ${title}.` });
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books by title." });
  }
});

// ---------------------------------------------------------------------------
// Task 5: Get the reviews for a book based on ISBN.
// ---------------------------------------------------------------------------
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }

  const reviews = books[isbn].reviews;
  if (Object.keys(reviews).length === 0) {
    return res.status(200).json({ message: "No reviews found for this book." });
  }

  return res.status(200).json(reviews);
});

module.exports.general = public_users;
