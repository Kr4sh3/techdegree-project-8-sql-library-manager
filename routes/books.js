var express = require('express');
var router = express.Router();
var Book = require('../models').Book;
const { Op } = require("sequelize");
const pageLimit = 8;

async function fetchBooks(searchTerm, page) {
    try {
        let books;
        if (searchTerm) {
            books = await Book.findAndCountAll({
                where: {
                    [Op.or]: ['title', 'author', 'genre', 'year'].map(field => ({
                        [field]: { [Op.substring]: searchTerm }
                    }))
                },
                limit: pageLimit,
                offset: page * pageLimit - pageLimit,
            });
        }
        else {
            books = await Book.findAndCountAll({
                limit: pageLimit,
                offset: page * pageLimit - pageLimit,
            });
        }
        const booksJSON = books.rows.map(book => book.toJSON());
        return [booksJSON, books.count];
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
    const searchTerm = req.query.search || "";
    const page = parseInt(req.query.page, 10) || 1;
    const [books, count] = await fetchBooks(searchTerm, page);
    const pageCount = Math.ceil(count / pageLimit);
    //Error handling
    if (books instanceof Error) {
        return next(books);
    }
    //Main book listing page
    res.render("index", { title: "Book Listings", books, page , pageCount, searchTerm});
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
