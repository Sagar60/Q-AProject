// index.js

const express = require('express');
const uploadRouter = require('./router');
const cors = require('cors');
const app = express();

app.use(cors());
// for parsing the body in POST request
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (_, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

//app.use(express.json());
//app.use(express.urlencoded({ extended: true }));
app.use(uploadRouter);

app.on('error', error => {
  console.error(error);
});

// running the server
const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log('Form running on port '+ port);
});
