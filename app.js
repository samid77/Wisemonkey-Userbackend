const express = require('express');
var app = express();

/** Establish connection to front end */
const reactConnection = require('cors');
app.use(reactConnection());

/** Establish a body parser */
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

/** Encryption configuration */
const crypto = require('crypto');
var secret = 'rahasia';

/** Establish file uploading */
var upload = require('express-fileupload');
app.use(upload());

/** Register the database and connect */
const mysql = require('mysql');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    port: '8889',
    database: 'wisemonkey',
    multipleStatements: true,
});
db.connect();

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
            var respond = 'oke';
            res.status(200).send(respond);
            console.log(respond);
        }
    });
});

/** User login */
app.post('/userlogin', (req, res) => {
    var Username = req.body.username;
    var Password = req.body.password;

    const encryptedPass = crypto.createHash('sha256', secret).update(Password).digest('hex');

    var sql = `SELECT * FROM users`;
    db.query(sql, (err, result) => {
        if(err){
            throw err;
            console.log(err);
        } else {
            for(var i=0; i < result.length; i++){
                if(Username === result[i].username && encryptedPass === result[i].password){
                    console.log('Username & password match');
                    var userID = result[i].id;
                    res.send(userID.toString());
                    res.status(200);
                    break;
                } else if(i === result.length - 1){
                    console.log('Credentials did not match');
                    res.status(404).send('Credential did not match');
                }
            }
        }
    })
})
/** Get user data */
app.post('/getUserData', (req, res) => {
    var id = req.body.userID;
    var sql = `SELECT * FROM users WHERE id="${id}"`;
    db.query(sql, (err, result) => {
        if(err) {
            throw err;
            console.log(err);
        } else {
            res.status(200).send(result);
        }
    })
})
