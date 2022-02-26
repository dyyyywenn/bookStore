var express = require('express');
var router = express.Router();
var path = require('path');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var dbConn = require('../library/db');
const { LocalStorage } = require("node-localstorage");
const { check, validationResult } = require("express-validator");
var localStorage = new LocalStorage("./scrath");

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
            errors_detail = "anda bukan admin";
            req.flash('msg_error', errors_detail);
            res.redirect("/");

        } else {
            // Todo jika user login dan sebagai admin
            dbConn.query('SELECT * FROM books', function(err, rows) {

                if (err) {
                    req.flash('msg_error', err);

                    res.render('admin/index', { data: '' });
                } else {

                    res.render('admin/index', { data: rows, user: user, });
                }
            });
        }


    }
});

router.get("/add", function(req, res, next) {
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
            res.redirect("/");
        } else {
            res.render('admin/add', {
                title: '',
                picture: '',
                description: '',
                author: '',
                publisher: '',
                price: ''
            });
        }


    }
});

router.post("/add", function(req, res, next) {
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
            res.redirect("/");
        } else {
            message = '';
            const errors = validationResult(req);
            if (!errors || req.method == "POST") {

                var post = req.body;
                var title = post.title;
                var description = post.description;
                var author = post.author;
                var publisher = post.publisher;
                var price = post.price;

                if (!req.files) {
                    console.log(errors);
                    errors_detail = "No files were uploaded";
                    req.flash('msg_error', errors_detail);
                    res.render('admin/add');
                }

                var file = req.files.picture;
                var img_name = file.name;

                if (file.mimetype == "image/jpeg") {

                    file.mv('public/images/upload/' + file.name, function(err) {

                        if (err)
                            return res.status(500).send(err);



                        var sql = "INSERT INTO `books`(`title`,`description`,`author`,`publisher`, `price` ,`picture`) VALUES ('" + title + "','" + description + "','" + author + "','" + publisher + "','" + price + "','" + img_name + "')";
                        dbConn.query(sql, function(err, result) {
                            if (err) {
                                var errors_detail = ("Error Insert : %s ", err);
                                req.flash('msg_error', errors_detail);
                                res.render('admin/add');
                            } else {
                                req.flash('msg_info', 'Create books success');
                                res.redirect('/books');
                            }

                        });

                    });
                } else {
                    console.log(errors);
                    errors_detail = "This format is not allowed , please upload file with '.jpg'";
                    req.flash('msg_error', errors_detail);
                    res.render('admin/add');
                }
            } else {
                console.log(errors);
                errors_detail = "Sory there are error <ul>";
                for (i in errors) {
                    error = errors[i];
                    errors_detail += '<li>' + error.msg + '</li>';
                }
                errors_detail += "</ul>";
                req.flash('msg_error', errors_detail);
                res.render('admin/add');
            }
        }


    }
});


router.delete("/delete/(:id)", function(req, res, next) {
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
            res.redirect("/");
        } else {
            // Todo jika user login dan sebagai admin
            var book = {
                id: req.params.id,
            }

            var delete_sql = 'delete from books where ?';
            dbConn.query(delete_sql, book, function(err, result) {
                if (err) {
                    var errors_detail = ("Error Delete : %s ", err);
                    req.flash('msg_error', errors_detail);
                    res.redirect('/books');
                } else {

                    req.flash('msg_info', 'Delete books Success');
                    res.redirect('/books');
                }
            });
        }


    }
});

router.get('/edit/(:id)', function(req, res, next) {
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
            res.redirect("/");
        } else {
            dbConn.query('SELECT * FROM books where id=' + req.params.id, function(err, rows) {
                if (err) {
                    var errornya = ("Error Selecting : %s ", err);
                    req.flash('msg_error', errors_detail);
                    res.redirect('/books');
                } else {
                    if (rows.length <= 0) {
                        req.flash('msg_error', "Customer can't be find!");
                        res.redirect('/books');
                    } else {
                        console.log(rows);
                        res.render('admin/edit', { title: "Edit ", data: rows[0] });
                    }
                }
            });
        }


    }

});
router.post('/edit/(:id)', function(req, res, next) {
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
            res.redirect("/");
        } else {
            let id = req.params.id;
            let title = req.body.title;
            let description = req.body.description;
            let author = req.body.author;
            let publisher = req.body.publisher;
            let price = req.body.price;

            let errors = false;

            if (title.length === 0 || author.length === 0) {
                errors = true;

                // set flash message
                req.flash('msg_error', "Please enter name and author");
                // render to add.ejs with flash message
                res.render('admin/edit', {
                    title: title,
                    description: description,
                    author: author,
                    publisher: publisher,
                    price: price
                })
            }

            // if no error
            if (!errors) {

                var form_data = {
                        title: title,
                        description: description,
                        author: author,
                        publisher: publisher,
                        price: price
                    }
                    // update query
                dbConn.query('UPDATE books SET ? WHERE id = ' + id, form_data, function(err, result) {
                    //if(err) throw err
                    if (err) {
                        // set flash message
                        req.flash('msg_error', err)
                            // render to edit.ejs
                        res.render('admin/edit', {
                            title: title,
                            description: description,
                            author: author,
                            publisher: publisher,
                            price: price
                        })
                    } else {
                        req.flash('msg_info', 'Book successfully updated');
                        res.redirect('/books');
                    }
                })
            }
        }


    }


});

router.get('/update/(:id)', function(req, res, next) {
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
            res.redirect("/");
        } else {
            dbConn.query('SELECT * FROM books where id=' + req.params.id, function(err, rows) {
                if (err) {
                    var errornya = ("Error Selecting : %s ", err);
                    req.flash('msg_error', errors_detail);
                    res.redirect('/books');
                } else {
                    if (rows.length <= 0) {
                        req.flash('msg_error', "Customer can't be find!");
                        res.redirect('/books');
                    } else {
                        console.log(rows);
                        res.render('admin/edit-image', { title: "Edit ", data: rows[0] });
                    }
                }
            });
        }


    }

});

router.post('/update/(:id)', function(req, res, next) {
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
            res.redirect("/");
        } else {
            let update_coupon = {};
            var file = req.files.picture;
            if (Object.keys(req.files).length != 0) // if user select file
            {
                const image_name = file.name;
                file.mv('public/images/upload/' + image_name, function(err) {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    dbConn.query('UPDATE books SET picture = ? WHERE id =' + req.params.id, image_name, (err, rows) => {
                        if (!err) {
                            req.flash('msg_info', 'Update image Success');
                            res.redirect('/books');
                        } else {
                            console.log(err);
                        }
                    });
                });
                update_coupon.image = image_name;
            } else {
                update_coupon.image = req.body.old_image; // if user didnot select file
            }
        }


    }

});

module.exports = router;