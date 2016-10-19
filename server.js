var express = require('express'),
    http    = require('http'),
    path    = require('path'),
    antidoteClient = require('antidote_ts_client')
    server  = express();

server.configure(function () {
  server.set('port', process.env.PORT || 1337);
  server.use(express.favicon());
  server.use(express.logger('dev'));
  server.use(express.bodyParser());
  server.use(express.methodOverride());
  server.use(server.router);
  server.use(express.static(path.join(__dirname, 'public')));
});

server.configure('development', function () {
  server.use(express.errorHandler());
});

// Antidote connection setup
let antidote = antidoteClient.connect(process.env.ANTIDOTE_PORT || 8087, process.env.ANTIDOTE_HOST || "localhost");
let cweepSet = antidote.set("cweepSet");

// ----- APP ----- //
server.get('/', function (req, res, next) { 
  res.sendfile('public/index.html');
});

server.get('/cweeps', function (req, res) {
  cweepSet.read().then(cweeps => {
    res.send(cweeps);
  })
});

server.post('/cweeps', function (req, res) {
  var cweep = req.body;
  return antidote.update(
    cweepSet.add(cweep)
  ).then(() => {
    res.status(200).send(cweep);
  });
});

// ----- start server -----
http.createServer(server).listen(server.get('port'), function () {
  console.log("Express server listening on port " + server.get('port'));
});