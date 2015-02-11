var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var http = require('http');
var path = require('path');

var app = express();

app.set('port', 5000);


app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json());
app.use(cookieParser());

//require('./routes/pages')(app);
require('./routes/services')(app);

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});