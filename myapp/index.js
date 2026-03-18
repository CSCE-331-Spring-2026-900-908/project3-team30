const express = require('express');
const app = express();
const port = 3000;

app.set("view engine", "ejs");

app.get('/', (req, res) => {
    const data = {name: 'Mario'};
    res.render('index', data);
});

app.get('/user', (req, res) => {
    res.send('Hello User!');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}/user`);
});

