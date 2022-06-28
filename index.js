// index.js

const express = require('express');
const uploadRouter = require('./router');

const app = express();

app.get('/', (_, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(uploadRouter);
const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log('Form running on port '+ port);
});
