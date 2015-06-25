var express = require('express');
var serveStatic = require('serve-static');
var h2 = require('./handler2');

var app = express();

// Serve webpack stuff
app.use('/assets', serveStatic('./build/'));

app.use(function(req, res) {
	res.status(200).send( 'Hello ' + h2() + '.');
});

module.exports = app;
