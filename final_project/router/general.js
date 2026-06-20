const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
const { isValid, users } = require("./auth_users.js");
const public_users = express.Router();

// Base URL used by the Axios-based methods (Tasks 10-13) to reach this
// same server. The async/await + Promise handlers below call these public
// endpoints over HTTP, exactly as the "Node.js program with 4 methods"
// requirement describes.
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

// ---------------------------------------------------------------------------
// Task 1 + Task 10: Get the list of all books, using async/await with Axios.
// ---------------------------------------------------------------------------
public_users.get('/', async (req, res) => {
  try {
    // Task 10 — async callback fetching the raw book list via Axios.
    const response = await axios.get(`${BASE_URL}/books`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching the book list.", error: error.message });
  }
});

// Raw book list, returned directly from the in-memory database.
// Used internally by the Axios-based methods above.
public_users.get('/books', (req, res) => {
  return res.status(200).json(books);
});

// ---------------------------------------------------------------------------
// Task 2 + Task 11: Get book details based on ISBN, using Promises with Axios.
// ---------------------------------------------------------------------------
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  // Task 11 — Promise-based retrieval of a single book by ISBN.
  axios
    .get(`${BASE_URL}/books`)
    .then((response) => {
      const allBooks = response.data;
      if (allBooks[isbn]) {
        return res.status(200).json(allBooks[isbn]);
      }
      return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    })
    .catch((error) => {
      return res.status(500).json({ message: "Error fetching book by ISBN.", error: error.message });
    });
});

// ---------------------------------------------------------------------------
// Task 3 + Task 12: Get all books by a given author, using Promises with Axios.
// ---------------------------------------------------------------------------
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author;

  axios
    .get(`${BASE_URL}/books`)
    .then((response) => {
      const allBooks = response.data;
      const matches = [];
      Object.keys(allBooks).forEach((isbn) => {
        if (allBooks[isbn].author.toLowerCase() === author.toLowerCase()) {
          matches.push({ isbn, ...allBooks[isbn] });
        }
      });

      if (matches.length > 0) {
        return res.status(200).json({ booksbyauthor: matches });
      }
      return res.status(404).json({ message: `No books found for author ${author}.` });
    })
    .catch((error) => {
      return res.status(500).json({ message: "Error fetching books by author.", error: error.message });
    });
});

// ---------------------------------------------------------------------------
// Task 4 + Task 13: Get all books by a given title, using async/await with Axios.
// ---------------------------------------------------------------------------
public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title;

  try {
    const response = await axios.get(`${BASE_URL}/books`);
    const allBooks = response.data;
    const matches = [];
    Object.keys(allBooks).forEach((isbn) => {
      if (allBooks[isbn].title.toLowerCase() === title.toLowerCase()) {
        matches.push({ isbn, ...allBooks[isbn] });
      }
    });

    if (matches.length > 0) {
      return res.status(200).json({ booksbytitle: matches });
    }
    return res.status(404).json({ message: `No books found with title ${title}.` });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by title.", error: error.message });
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

  return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;
