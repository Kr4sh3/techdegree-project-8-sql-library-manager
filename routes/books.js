var express = require('express');
var router = express.Router();
var Book = require('../models').Book;

async function fetchBooks() {
    try {
        const books = await Book.findAll();
        const booksJSON = books.map(book => book.toJSON());
        return booksJSON;
    } catch (error) {
        return error;
    }
}

async function fetchBook(id) {
    try {
        const book = await Book.findByPk(id);
        const bookJSON = book.toJSON();
        return bookJSON;
    } catch (error) {
        return error;
    }
}

async function postBook(book) {
    try {
        await Book.create(book);
    } catch (error) {
        return error;
    }
}

async function updateBook(id, book) {
    try {
        await Book.update(book, { where: { id } });
    } catch (error) {
        return error;
    }
}

async function deleteBook(id) {
    try {
        await Book.destroy({ where: { id } });
    } catch (error) {
        return error;
    }
}

/* GET books page. */
router.get('/', async (req, res, next) => {
    const books = await fetchBooks();
    //Error handling
    if (books instanceof Error) {
        return next(books);
    }
    //Main book listing page
    res.render("index", { title: "Book Listings", books });
});

//Display new book form
router.get('/new', (req, res) => {
    res.render("new-book", { title: "New Book Page" });
});

//Post new book to database
router.post('/new', async (req, res) => {
    const book = req.body;
    const error = await postBook(book);
    //Error handling
    if (error) {
        const errors = error.errors.map(err => { return err.message; });
        return res.render("new-book", { errors, title: "New Book Page" });
    }
    res.redirect('/books');
});

//Get book update form
router.get('/:id', async (req, res, next) => {
    const book = await fetchBook(req.params.id);
    if (book instanceof Error) {
        return next(book);
    }
    res.render("update-book", { title: book.title, book });
});

//Post updated book to database
router.post('/:id', async (req, res) => {
    const book = req.body;
    const error = await updateBook(req.params.id, book);
    //Error handling
    if (error) {
        const errors = error.errors.map(err => { return err.message; });
        return res.render("update-book", { errors, book, title: book.title });
    }
    res.redirect('/books');
});

//Delete book from database
router.post('/:id/delete', async (req, res, next) => {
    const error = await deleteBook(req.params.id);
    //Error handling
    if (error) {
        return next(error);
    }
    res.redirect('/books');
});

module.exports = router;
