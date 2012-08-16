#!/usr/bin/node

var connect = require("connect"),
    express = require("express"),
    server = express(),
    fs = require("fs"),
    pubDir = __dirname + "/app",
    port = process.env.PORT || 8888;

server.configure(function () {
    server.use(express.logger("dev"));
    server.use(express.static(pubDir));
});



// Handles requests to the root path ("/") my simply sending the "shell" page
// which creates the `Y.App` instance.

server.get('/stats/', function(req, res) {
    res.json({
	uptime: process.uptime(),
	memory: process.memoryUsage()
    });
});

server.get('*', function (req, res) {
    res.sendfile('app/index.html');
});

server.get('*', function (req, res) {
        res.redirect('/#' + req.url);
});

server.listen(port, function () {
    // Write a pidfile
    var pid_file = fs.openSync("server-" + port + ".pid", "w");
    fs.write(pid_file, process.pid);
    fs.close(pid_file);
    console.log('Server listening on ' + port);
    console.log('Serving content from ' + pubDir);
});