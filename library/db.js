var mysql = require("mysql");
var connection = mysql.createConnection({
    host: "localhost",
    user: "root", // your mysql user
    password: "", // your mysql password
    port: 3306, //port mysql
    database: "tokoBuku", // your database name
});
connection.connect(function(error) {
    if (!!error) {
        console.log(error);
    } else {
        console.log("Database Conected..!");
    }
});

module.exports = connection;