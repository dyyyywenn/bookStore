var express = require('express');
var router = express.Router();
var dbConn = require('../library/db');
const { LocalStorage } = require("node-localstorage");

var localStorage = new LocalStorage("./scrath");
// display books page
router.get("/", function(req, res, next) {
    var user;
    if (localStorage.getItem("user") != undefined) {
        user = JSON.parse(localStorage.getItem("user"));
    } else if (req.session.user != undefined) {
        user = JSON.parse(req.session.user);
    }
    if (user == undefined) {
        res.redirect("/login");
    } else {
        dbConn.query('SELECT * FROM books', function(err, rows) {

            if (err) {
                req.flash('msg_error', err);
                res.render('user/book', { data: '' });
            } else {
                res.render('user/book', { data: rows });
            }
        });
    }
});

router.get("/detail/(:id)", function(req, res, next) {
    var user;
    if (localStorage.getItem("user") != undefined) {
        user = JSON.parse(localStorage.getItem("user"));
    } else if (req.session.user != undefined) {
        user = JSON.parse(req.session.user);
    }
    if (user == undefined) {
        res.redirect("/login");
    } else {
        dbConn.query('SELECT * FROM books where id=' + req.params.id, function(err, rows) {
            if (err) {
                var errors_detail = ("Error Selecting : %s ", err);
                req.flash('msg_error', errors_detail);
                res.redirect('/users');
            } else {
                if (rows.length <= 0) {
                    req.flash('msg_error', "Books can't be find!");
                    res.redirect('/users');
                } else {
                    console.log(rows);
                    res.render('user/detail', { title: "Edit ", data: rows[0] });
                }
            }
        });
    }
});





module.exports = router;