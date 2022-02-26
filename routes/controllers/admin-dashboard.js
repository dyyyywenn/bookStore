var express = require("express");
var router = express.Router();

const { LocalStorage } = require("node-localstorage");

var localStorage = new LocalStorage("./scrath");
var dbcon = require("../../library/db");
//?         get admin page
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
        if (user[2] != 1) {
            res.redirect("/users");
        } else {
            // Todo jika user login dan sebagai admin
            res.redirect("/books");
        }
    }
});

module.exports = router;