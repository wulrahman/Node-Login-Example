const express = require("express");
const body_parser = require("body-parser");
const path = require("path");
const http = require('http');
const socket = require('socket.io');
const cookie_parser = require('cookie-parser')
const rake = require('node-rake')

// const SEOChecker = require('advanced-seo-checker');
// let baseURL = 'http://hazemhagrass.com';
// let urls = [baseURL, 'http://hazemhagrass.com/blog'];
// let crawler1 = SEOChecker(baseURL, {});
// crawler1.analyze(urls).then(function (summary) {
//   let util = require('util');
//   console.log(util.inspect(summary));
// });

// https://www.npmjs.com/package/heikinashi

const mysql = require('./connection');
const auth = require('./auth');
const crawler = require('./crawler');
const meta_data = require('./meta_data');

const views_dir_path = path.join(__dirname, "templates", "views");
const app = express();

app.use(cookie_parser());
app.set('trust proxy', 1) // trust first proxy
app.use(body_parser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", views_dir_path);
app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app);
const socket_main = socket.listen(server);

app.get("/", (request, response) => {
  response.render("home", {clicks:request.cookies.user_id});
});

app.route('/login')
  .get((request, response) => {
    response.render("login");
  });

app.route('/register')
  .get((request, response) => {
    response.render("register");
  });

socket_main.on('connection', (client) => {
  client.on('login-attempt', (auth_user) => {
    auth.login(auth_user, function(status){
      console.log(status);
      auth.set_login_cookie(auth_user, status, function(session_status) {
        console.log(session_status);
        if(status.login) {
          client.emit('set-cookie', { cookie: session_status});
        }
      });
      if(status.login) {
        client.emit('redirect', "/");
      }
      client.emit('login', { status: status });
    });
  });

  client.on('register-attempt', (auth_user) => {
    auth.register(auth_user, function(status) {
      auth.create_account(auth_user, function(status) {
        console.log(status);
        client.emit('register', { status: status });
      });
    });
  });

  client.on('content-request', (content_request) => {
    main_url = crawler.append_scheme(content_request.url);
    console.log(main_url.host);
    crawler.hostnameExists(main_url.host, (status) => {
      console.log(status);
      if(status.exists) {
        crawler.valid_main_url(main_url, status, (resolve) => {
          if (resolve.url_valid) {
            crawler.content_request(resolve.main_url, (content) => {
              console.log(content);
              meta_data.meta_data(content, (meta) => {
                client.emit('content', { content: content, processed:meta});
                console.log(meta);
              });
            });
          }
          console.log(resolve);
        });
      }
    });
  });
});

server.listen(80, () => {
  console.log("server started on port 3000");
});
