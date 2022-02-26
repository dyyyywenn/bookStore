var express = require("express");
var router = express.Router();

const { check, validationResult } = require("express-validator");
const { LocalStorage } = require("node-localstorage");
const bcrypt = require("bcrypt");

const localStorage = new LocalStorage("./scrath");
var dbcon = require("../../library/db");

router.get('/', function(req, res) {
    localStorage.clear();
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/login');
        }
    });
});


module.exports = router;