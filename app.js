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

/** Image configuration */
app.use('/pics', express.static('pics'));


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

/** Get featured product data */
app.get('/featuredProduct', (req, res) => {
    var sql = `SELECT * FROM product LIMIT 8`;
    db.query(sql, (err, result) => {
        if(err){
            throw err;
            console.log(err);
        } else {
            res.send(result);
        }
    })
})
/** Get discount product data */
app.get('/discountProduct', (req, res) => {
    var sql = `SELECT * FROM product LIMIT 8`;
    db.query(sql, (err, result) => {
        if(err){
            throw err;
            console.log(err);
        } else {
            res.send(result);
        }
    })
})
/** Product detail */
app.get('/productDetail/:id', (req, res) => {
    var productID = req.params.id;
    var sql = `SELECT * FROM product WHERE id="${productID}"`;
    db.query(sql, (err, result) => {
        if(err) {
            throw err;
            console.log(err);
        } else {
            res.send(result);
        }
    });
})
/** Order/Cart Process */
app.post('/cart', (req, res) => {
    var userID = req.body.userID;
    var Quantity = req.body.num;
    var productID = req.body.idproduct;
    var productCode = req.body.productcode;
    var productPrice = req.body.productprice;
    var productName = req.body.productname;
    var status = 2;

    var sql = `SELECT * FROM cart WHERE user_id="${userID}" AND product_id="${productID}" AND status="${status}"`;

    db.query(sql, (err, result) => {
        if(err) {
            // throw err;
            console.log('error di sql1 cart');
        } else {
            if(result.length > 0){
                var sql2 = `UPDATE cart SET quantity="${Quantity}" WHERE product_id="${productID}"`;
                db.query(sql2, (err, result) => {
                    if(err){
                        console.log('error di sql2 cart')
                    } else {
                        var status = '1';
                        res.send(status);
                    }
                })
            } else {
                var sql3 = `INSERT INTO cart (user_id, product_id, product_name, quantity, product_price, status) VALUES("${userID}","${productID}","${productName}","${Quantity}", "${productPrice}","${status}")`;
                db.query(sql3, (err, result) => {
                    if(err){
                        // throw err;
                        console.log('error di sql3')
                    } else {
                        var status = '1';
                        res.send(status);
                    }
                });
            }
        }
    });
})

/** Display data for cart */
app.post('/displayCart', (req, res) => {
    var userID = req.body.userID;
    var sql = `SELECT * FROM cart WHERE user_id="${userID}" AND status="2";`
    sql += `SELECT id, product_price * quantity AS "total_sub_price" FROM cart WHERE user_id="${userID}" AND status="2"`;
    db.query(sql, (err, result) => {
        if(err){
            console.log('error di post displaycart');
        } else {
            res.send(result);
        }
    })
})
app.get('/displayCart', (req, res) => {
    var sql = `SELECT * FROM master_delivery`;
    db.query(sql, (err, result) => {
        if(err){
            throw err;
        } else {
            res.send(result);
        }
    })
})

/** Update Cart Data */
app.post('/updateCart', (req, res) => {
    var cartID = req.body.cartID;
    var quantity = req.body.newQuantity;
    var userID = req.body.userID;

    var sql = `UPDATE cart SET quantity="${quantity}" WHERE id="${cartID}" AND status="2"`;
    db.query(sql, (err, result) => {
        if(err){
            throw err;
        } else {
            var getCartData = `SELECT * FROM cart WHERE user_id="${userID}" AND status="2";`
            getCartData += `SELECT id, product_price * quantity AS "total_sub_price FROM cart WHERE user_id="${userID}" AND status="2"`;
            db.query(getCartData, (err, result) => {
                if(err){
                    console.log('error di getCartData');
                } else {
                    res.send(result);
                }
            })
        }
    });
})

/** Hapus data Cart */
app.post('/deleteCart', (req, res) => {
    var cartID = req.body.cartID;
    var sql = `DELETE FROM cart WHERE id="${cartID}"`;
    db.query(sql, (err, result) => {
        if(err) {
            throw err;
        } else {
            res.send(result);
        }
    })
})
