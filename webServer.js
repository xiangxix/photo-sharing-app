"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */
const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 5000;

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const ObjectId = require('mongodb').ObjectID;
// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require('./schema/user.js');
const Photo = require('./schema/photo.js');
const SchemaInfo = require('./schema/schemaInfo.js');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://heroku_xkssftvv:2963q9905i1o6tmkfggphgvj2n@ds311128.mlab.com:11128/heroku_xkssftvv',
    {useNewUrlParser: true});



// Express middleware layer that handles session management for you
const session = require('express-session');
// Add the express-session
app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
/*
 * Express middleware layer for parsing the body of HTTP requests
 * Use it to parse the JSON encoded POST request bodies that used in server API
 * if you pass a request with a body consisting of JSON object with a property
 * parameter_name it will show up in the Express request handler as 
 * request.body.parameter_name
 */
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// Express middleware body parser capable of handling the multi part forms 
// we need to upload photos

Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, // month
        "d+": this.getDate(), // day
        "h+": this.getHours(), // hours
        "m+": this.getMinutes(), // minite
        "s+": this.getSeconds(), // second
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
app.use('/admin', require('./routes/admin'));
app.use('/user', require('./routes/user'));
app.use('/photo', require('./routes/photo'));
app.use('/comment',require('./routes/comment'));

if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname, 'photo-sharing','build')));
    app.get('*', (request, response) => {
        response.sendFile(path.join(__dirname, 'photo-sharing', 'build', 'index.html'));
    });
} else {
    app.use(express.static(__dirname));
}

app.listen(port, function () {
    console.log(`Server started on port ${port}`);
});
