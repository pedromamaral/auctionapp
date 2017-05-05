/**
 * Express app to serve Angular 2 single page auction site
 * author: Pedro Amaral 
 */

const express = require('express');
const path = require('path');//object to deal with paths
const favicon = require('serve-favicon');
const jwt = require('express-jwt'); //to deal with authentication based in tokens
const morgan = require('morgan'); // Logs each server request to the console
const cookieParser = require('cookie-parser');
const http = require('http');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); // to deal with the mongodb database
var databaseUri = 'mongodb://pfa:HkotSBncWuksjaZu@cluster0-shard-00-00-phdib.mongodb.net:27017,cluster0-shard-00-01-phdib.mongodb.net:27017,cluster0-shard-00-02-phdib.mongodb.net:27017/auctionsite?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin';

var secret = 'this is the secret secret secret 12356'; // same secret as in socket.js and api.js used her to verufy the Authorization token

//get the file with the API routes 
const routes = require('./server/routes/api');

//get the file with the socket api code
const socket = require('./server/routes/socket')


const app = express(); //the Ex
app.use(morgan ('dev')); // use developer logs
//parser for POST JSON data
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());

//POint static path to dist directory
app.use(express.static(path.join(__dirname, 'dist')));
app.use (favicon(path.join(__dirname,'dist/favicon.ico')));

//Set up URIs that require Jwt authentication 
app.use('/newitem',jwt({secret:secret}));// set up authentication for HTTP requests to "/newitem" url
app.use('/items',jwt({secret:secret}));// set up authentication for HTTP requests to "/newitem" url
app.use('/users',jwt({secret:secret}));// set up authentication for HTTP requests to "/newitem" url
// Set our api routes
app.post('/api/authenticate', routes.Authenticate); //route to deal with the post of the authentication form
app.post('/api/newuser', routes.NewUser); //route to deal with the post of the register form
app.post('/api/newitem', routes.NewItem); //route to deal with the post of the new item form
app.get('/api/items', routes.GetItems); //route to deal with the get all items call to the api
app.get('/api/users', routes.GetUsers); //route to deal with the get all items call to the api

// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//connect to the database
var uri = 


mongoose.connect(databaseUri); // Connects to your MongoDB.  Make sure mongod is running!
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});


//defines the port
const port = '3000'
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
* Create websocket listening on the same port as the http server
*/
const io = require('socket.io')(server);
socket.StartSocket(io); // call the StartSocket function in socket module

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log(`API running on localhost:${port}`));