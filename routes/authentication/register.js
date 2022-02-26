var express = require("express");
var router = express.Router();

const { LocalStorage } = require("node-localstorage");

var localStorage = new LocalStorage("./scrath");

var dbcon = require("../../library/db");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

var session_store;
/* GET home page. */
router.get("/", function(req, res, next) {
    res.render("main/register", {
        name: "",
        email: "",
        password: "",
        passwordConfirmation: "",
        title: "Register",
    });
});
router.post(
    "/", [
        //? validator
        check("txtName", "Fill the username field").not().isEmpty(),
        check("txtEmail", "Fill the email field").not().isEmpty(),
        check("txtPassword", "Fill the password field").not().isEmpty(),
        check(
            "txtPasswordConfirmation",
            "Your password must be at least 8 characters"
        )
        .not()
        .isEmpty()
        .isLength({ min: 8 }),
    ],
    function(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            //? validator error responses
            errors_detail = "<p>Sory there are error</p><ul>";
            for (let i = 0; i < errors.errors.length; i++) {
                const error = errors.errors[i];
                errors_detail += "<li>" + error.msg + "</li>";
            }
            errors_detail += "</ul>";
            req.flash("msg_error", errors_detail);
            res.render("main/register", {
                name: req.body.txtName == undefined ? "" : req.body.txtName,
                email: req.body.txtEmail == undefined ? "" : req.body.txtEmail,
                password: req.body.txtPassword == undefined ? "" : req.body.txtPassword,
                passwordConfirmation: req.body.txtPasswordConfirmation == undefined ?
                    "" : req.body.txtPasswordConfirmation,
            });
        } else {
            const data = req.body;
            //? check matching password
            if (data.txtPassword != data.txtPasswordConfirmation) {
                //? password confirmation does not match with password
                error =
                    "<p>Sory there are error</p><ul><li>Password confirmation does not match</li>";
                req.flash("msg_error", error);
                res.render("main/register", {
                    name: req.body.txtName == undefined ? "" : req.body.txtName,
                    email: req.body.txtEmail == undefined ? "" : req.body.txtEmail,
                    password: req.body.txtPassword == undefined ? "" : req.body.txtPassword,
                    passwordConfirmation: req.body.txtPasswordConfirmation == undefined ?
                        "" : req.body.txtPasswordConfirmation,
                });
            } else {
                session_store = req.session;
                //? all validation success
                let name = req.body.txtName;
                let email = req.body.txtEmail;
                let password = req.body.txtPassword;

                var salt = bcrypt.genSaltSync(10);
                var hash = bcrypt.hashSync(password, salt);
                var form_data = {
                    name: name,
                    email: email,
                    password: hash,
                };

                dbcon.query(
                    "INSERT INTO user SET ?",
                    form_data,
                    function(err, result) {
                        if (err) {
                            req.flash("msg_error", "<p>" + err + "</p>");
                            res.render("main/register", {
                                name: req.body.txtName == undefined ? "" : req.body.txtName,
                                email: req.body.txtEmail == undefined ? "" : req.body.txtEmail,
                                password: req.body.txtPassword == undefined ? "" : req.body.txtPassword,
                                passwordConfirmation: req.body.txtPasswordConfirmation == undefined ?
                                    "" : req.body.txtPasswordConfirmation,
                            });
                        } else {
                            var user = JSON.stringify([name, email, 0]);
                            console.log(req.body.boolRemember);
                            if (req.body.boolRemember != 1) {
                                localStorage.setItem("user", user);
                            } else {
                                session_store.user = user;
                            }
                            res.redirect("/login");
                        }
                    }
                );
            }
        }
    }
);

module.exports = router;