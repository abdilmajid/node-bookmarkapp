const express = require('express');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pg = require('pg');


const path = require('path');

const app = express();
// Database string
const config = {
  user: 'postgres',
  database: 'booklist',
  password: 123456,
  port: 5432,
}

const pool = new pg.Pool(config);

const mustache = mustacheExpress();

mustache.cache = null; 
app.engine('mustache', mustache);
app.set('view engine', 'mustache');


app.use(express.static('public'));
// Extended true ->is a nested  
// Extended False ->not nested object
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());


//Where we put the booklist
app.get('/books', (req, res) => {
  pool.connect((err, client, done) => {
    if(err) {
      console.log('error fetching client from pool', err);
    }
    client.query('SELECT * FROM books', (err, result) => {
      done();
      if(err) {
        console.log('error running query', err);
      }
      res.render('book-list', {books: result.rows});
    })
  })
}) 

app.get('/book/add', (req, res) => {
  res.render('book-form')
})


app.post('/book/add', (req, res) => {
  console.log('works');
  pool.connect()
    .then(() => {
      const sql = 'INSERT INTO books (title, author) VALUES ($1, $2)'
      const params = [req.body.title, req.body.author];
      return pool.query(sql, params);
    })
    .then((result) => {
      console.log('result?', result);
      res.redirect('/books');
    })

 });

app.listen(process.env.PORT || 5006, () => {
  console.log(`App Running on port ${process.env.PORT}`)
});