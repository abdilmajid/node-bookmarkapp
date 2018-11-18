const express = require('express');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pg = require('pg');
const path = require('path');
const multer = require('multer');
const cons = require('consolidate');
const ejs = require('ejs');

// pgCamelCase removes the (id) from appearing on browser
const pgCamelCase = require('pg-camelcase');
pgCamelCase.inject(require('pg'));


const app = express();
// Database string
const config = {
  user: 'postgres',
  database: 'booklist',
  password: 123456,
  port: 5432,
}

//Connect to Postgres
const pool = new pg.Pool(config);
// Setup HTML Templating
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


// //Set Storage Engine
// const storage = multer.diskStorage({
//   destination: './public/uploads/',
//   // request, file, callback(for errors)
//   filename: (req, file, cb) => {
//     //first param is error, we don't want error so we say null
//     // second is what we call the file(add timestamp to file name b/c don't want 2 files with same name)
//     cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//   }
// })

// //Init Upload
// const upload = multer({
//   storage: storage, 
//   limits: {fileSize: 10000000}, //Image size limit }
//   fileFilter: (req, file, cb) => { //types of file that can be uploaded
//       checkFiletype(file, cb)
//   }
// }).single('myImage');


// checkFiletype = (file, cb) => {
//   // allowed file extensions
//   const filetypes = /jpeg|jpg|png|gif|mp4/;
//   // check extenstions
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   // check mime
//   const mimetype = filetypes.test(file.mimetype);

//   if(extname && mimetype) {
//     return cb(null, true);
//   } else {
//     cb('Error: Images Only!')
//   }
// }

// // Creating GET request, redering template
// // saying '/' is our index
// app.get('/', (req, res) => {
//   return res.render('index')
// });

messageUndefined = () => {
  if(typeof msg !== 'undefined'){
    res.render('index', msg);
  }
}


//Where we put the booklist
app.get('/books', (req, res) => {
// Show Database Items on the browser
  pool.connect() // connects to Postgres, then do stuff
    .then(() => {
      return pool.query('SELECT * FROM books')
    })
    .then((results) => {
      console.log('results', results);
      //{books: results.row} ->allows for only rusults we want to be returned
      res.render('book-list', {books: results.rows});
    })
    .catch((err) => {
      // console.log('error', err);
      res.send('Something went wrong');
    })
}) 

app.get('/book/add', (req, res) => {
  res.render('book-form')
})


// Adding Items to Database
app.post('/book/add', (req, res) => {
  console.log('works');
  pool.connect()
    .then(() => {
      // Use paramaters when needing to insert values (here we need
      // title and author)
      const sql = 'INSERT INTO books (title, author) VALUES ($1, $2)'
      const params = [req.body.title, req.body.author];
      return pool.query(sql, params);
    })
    .then((result) => {
      console.log('result?', result);
      res.redirect('/books');
    })
 });

app.post('/book/delete/:id', (req, res) => {
  // Deleting items from database
  // console.log('Post Deleted', req.params.id);
  pool.connect()
    .then(() => {
      // Use params b/c need value book_id
      const sql = 'DELETE FROM books WHERE book_id = $1;'
      const params = [req.params.id];
      return pool.query(sql, params);
    })
    .then((results) => {
      console.log('delete results', results);
      res.redirect('/books');
    })
    .catch((err) => {
      console.log('err', err);
      res.redirect('/books');
    })
})

app.get('/book/edit/:id',(req, res) => {
  pool.connect()
    .then(() =>{
      // res.render('book-edit')
      // console.log('editpage loaded')
      const sql = 'SELECT * FROM books WHERE book_id = $1;'
      const params = [req.params.id];
      return pool.query(sql, params);
    })
    .then((results) => {
      if(results.rowCount !== 0) {
        res.render('book-edit', {books: results.rows[0]});
      } else {
        res.redirect('/books')
      }
    })
    .catch((err) => {
      console.log('ERROR!!!!!!', err)
      res.render('error-page');
    })
})

app.post('/book/edit/:id', (req, res) =>{
  pool.connect()
    .then(() => {
      const sql = 'UPDATE books SET title = $1, author = $2 WHERE book_id = $3;'
      const params = [req.body.title, req.body.author, req.params.id];
      return pool.query(sql, params);
    })
    .then((results) => {
      console.log('updated results', results)
      res.redirect('/books')
    })
    .catch((err) => {
      console.log('Something went wrong', err)
    })
})




app.listen(process.env.PORT || 5006, () => {
  console.log(`App Running on port ${process.env.PORT}`)
});