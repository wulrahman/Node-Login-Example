var mysql = require('mysql');

var connection = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "D8a888cee5",
  socketPath:"/tmp/mysql.sock",
  database : 'website'
  // insecureAuth : true
});

exports.connection = connection;

connection.connect(function(error_main) {
  if (error_main) {
    throw error_main;
  }
  else {
    console.log("connected to mysql server!");
  }
});
