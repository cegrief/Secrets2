/**
 * Created by Corey on 10/17/2014.
 */
mongoose.connect('mongodb://localhost/mathstack');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to mongo server.');
});

var express = require('express');
var http = require('http');
var path = require('path');

var app = express();

if (process.env.ENV === "prod") {
    app.set('port', 80);
} else {
    app.set('port', 3000);
}

app.set('views', path.join(__dirname, 'views'));
app.use(express
    .static(path.join(__dirname, 'app')));

require('./routes/pages')(app);
require('./routes/services')(app);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});