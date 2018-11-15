const express = require('express');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex');

// require('dotenv').config();

const db = knex({
  client: 'pg',
  connection: {
    host : 'localhost',
    user : 'postgres',
    password : '123456',
    database : 'booklist'
  }
});


db.select('*').from('books').then(data => {
  console.log(data);
})


const app = express();
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
app.get('/list', (req, res) => {
  res.render('list');
}) 

app.get('/book/add', (req, res) => {
  res.render('bookForm')
})

app.post('/book/add', (req, res) => {
  const { title, author } = req.body;
  db('books').insert({
    title: title,
    author: author
  })
  .then(() => {
    res.redirect('/list');
  })
  .catch((err) => {
    console.log(err);
  })
 });



app.listen(process.env.PORT || 5006, () => {
  console.log(`App Running on port ${process.env.PORT}`)
});