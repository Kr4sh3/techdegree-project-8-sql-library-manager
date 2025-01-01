var express = require('express');
var router = express.Router();
var Book = require('../models').Book;

async function fetchBooks() {
    try {
        const books = await Book.findAll();
        const booksJSON = books.map(book => book.toJSON());
        return booksJSON;
    } catch {
        return "There was an error retrieving the books";
    }
}

async function fetchBook(id) {
    try {
        const book = await Book.findByPk(id);
        const bookJSON = book.toJSON();
        return bookJSON;
    } catch {
        return "There was an error retrieving the book";
    }
}

async function postBook(book) {
    try {
        await Book.create(book);
    } catch {
        return "There was an error creating the book";
    }
}

async function updateBook(id, book) {
    try {
        await Book.update(book, { where: { id } });
    } catch {
        return "There was an error updating the book";
    }
}

async function deleteBook(id) {
    try {
        await Book.destroy({ where: { id } });
    } catch {
        return "There was an error deleting the book";
    }
}

/* GET books page. */
router.get('/', async (req, res) => {
    const books = await fetchBooks();

    res.locals.title = "Book Listings";
    res.locals.books = books;

    //Main book listing page
    res.render("index");
});

//Display new book form
router.get('/new', (req, res) => {
    res.locals.title = "New Book Page";
    res.render("new-book");
});

//Post new book to database
router.post('/new', async (req, res) => {
    const book = req.body;
    await postBook(book);
    res.redirect('/books');
});

//Get book update form
router.get('/:id', async (req, res) => {
    const book = await fetchBook(req.params.id);
    res.locals.title = book.title;
    res.locals.book = book;

    res.render("update-book");
});

//Post updated book to database
router.post('/:id/update', async (req, res) => {
    const book = req.body;
    await updateBook(req.params.id, book);
    res.redirect('/books');
});

//Delete book from database
router.post('/:id/delete', async (req, res) => {
    await deleteBook(req.params.id);
    res.redirect('/books');
});

module.exports = router;
