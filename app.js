const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const reactConnection = require('cors');
const crypto = require('crypto');
var secret = 'rahasia';

var app = express();

/** Register the database and connect */
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    port: '8889',
    database: 'wisemonkey',
    multipleStatements: true,
});
db.connect();

/** Making the node accessible by React */
app.use(reactConnection());

/** Bodyparser middleware setup */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

/** Establish a web server */
app.listen(8005, (req, res) => {
    console.log('Wisemonkey User Backend started at port 8005 ...');
});

/** Users Registration & Login Functionality */
app.post('/registration', (req, res) => {
    var fullname = req.body.fullname;
    var username = req.body.username;
    var email = req.body.email;
    var phone = req.body.phone;
    var password = req.body.password;
    var address = req.body.address;
    var encrypted = crypto.createHash('sha256', secret).update(password).digest('hex');

    var sql = `INSERT INTO users (full_name, email, username, password, address, phone) VALUES("${fullname}", "${email}", "${username}", "${encrypted}", "${address}", "${phone}")`;

    db.query(sql, (err, result) => {
        if(err) {
            console.log(err);
            throw err;
        } else {
            res.status(200).send('Registrasi berhasil');
        }
    });
});


