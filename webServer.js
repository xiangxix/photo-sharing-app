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

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require('./schema/user.js');
const Photo = require('./schema/photo.js');
const SchemaInfo = require('./schema/schemaInfo.js');

const async = require('async');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;
// Express middleware layer that handles session management for you
const session = require('express-session');

/*
 * Express middleware layer for parsing the body of HTTP requests
 * Use it to parse the JSON encoded POST request bodies that used in server API
 * if you pass a request with a body consisting of JSON object with a property
 * parameter_name it will show up in the Express request handler as 
 * request.body.parameter_name
 */
var bodyParser = require('body-parser');

// Express middleware body parser capable of handling the multi part forms 
// we need to upload photos
const multer = require('multer');
const processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');

const ObjectId = require('mongodb').ObjectID;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/cs142project6',
    {useNewUrlParser: true});

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));

// Add the express-session and body-parser middleware to express
app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());


// Date.prototype.Format = function (fmt) { 
//     var o = {
//         "M+": this.getMonth() + 1, // month
//         "d+": this.getDate(), // day
//         "h+": this.getHours(), // hours
//         "m+": this.getMinutes(), // minite
//         "s+": this.getSeconds(), // second
//         "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
//         "S": this.getMilliseconds() //毫秒 
//     };
//     if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
//     for (var k in o)
//     if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
//     return fmt;
// }

app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.count({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));
            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

//login
app.post('/admin/login', function (request, response) {
    const login_name = request.body.login_name;
    const password = request.body.password;

    User.findOne({
        login_name: login_name
    }, function (err, user) {
        if (err) {
            console.error('Doing /admin/login', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (!user) {
            console.log('User ' + login_name + ' do not Exist.');
            response.status(400).send('User' + login_name + 'do not Exist.');
            return;
        }
        const salt = user.salt;
        const digest = crypto.createHash('sha1').update(password + salt).digest('hex');
        if (digest !== user.password_digest) {
            response.status(400).send("Incorrect Password");
        } else {
            request.session.user = user;
            response.status(200).send(user);
        }
    });
});

//logout
app.post('/admin/logout', function (request, response) {
    request.session.destroy(function (err) {
        if (err) {
            response.status(400).send();
            return;
        } else {
            response.status(200).send();
            return;
        }
    });
});

app.get('/login-user', function(request, response) {
	if (!request.session || !request.session.user) {
		response.status(401).send("User hasn't signed in.");
		return;
	}
	let user = {
		_id : request.session.user._id,
		first_name : request.session.user.first_name,
		login_name : request.session.user.login_name,
	};
	response.status(200).send(JSON.stringify(user));
});

//register
app.post('/user', function (request, response) {

    if (!request.body.login_name || request.body.login_name.length === 0) {
        response.status(400).send("Login_name undefined.");
        return;
    }
    if (!request.body.first_name || request.body.first_name.length === 0) {
        response.status(400).send("Firstname undefined.");
        return;
    }
    if (!request.body.last_name || request.body.last_name.length === 0) {
        response.status(400).send("Lastname undefined.");
        return;
    }
    if (!request.body.location || request.body.location.length === 0) {
        response.status(400).send("location undefined");
        return;
    }
    if (!request.body.description || request.body.description.length === 0) {
        response.status(400).send("description undefined");
        return;
    }
    if (!request.body.occupation || request.body.occupation.length === 0) {
        response.status(400).send("occupation undefined");
        return;
    }
    if (!request.body.password || request.body.password.length === 0) {
        response.status(400).send("password undefined");
        return;
    }

    User.findOne({
        login_name: request.body.login_name
    }, function (err, user) {
        if (err) {
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (user) {
            response.status(400).send("Login name exists.");
            return;
        }
        const pwd = request.body.password;
        crypto.randomBytes(8, (err, buf) => {
            if (err) throw err;
            const salt = buf.toString('hex');
            const digest = crypto.createHash('sha1').update(pwd + salt).digest('hex');
            User.create({
                login_name: request.body.login_name,
                salt: salt,
                password_digest: digest,
                first_name: request.body.first_name,
                last_name: request.body.last_name,
                location: request.body.location,
                description: request.body.description,
                occupation: request.body.occupation
            }, function (err, user) {
                if (err) {
                    response.status(500).send(JSON.stringify(err));
                    return;
                }
                user.save();
                request.session.user = user;
                console.log("create new user successfully.")
                response.status(200).send(user);
            });
        });
    });
});

// upload new photo
app.post('/photos/new', function (request, response) {
    if (!request.session || !request.session.user) {
        response.status(401).send("User hasn't signed in.");
        return;
    }
    processFormBody(request, response, function (err) {
        if (err) {
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (!request.file) {
            response.status(400).send("Please upload a photo");
            return;
        }
        let timestamp = new Date().valueOf();
        let filename = 'U' + String(timestamp) + request.file.originalname;
        fs.writeFile("./images/" + filename, request.file.buffer, function (err) {
            // response.status(400).send(JSON.stringify(err));
            if (err) {
                console.log("Writing image error.");
            }
            return;
        });

        Photo.create({
            file_name: filename,
            user_id: request.session.user._id,
        }, function (error, photo) {
            if (err) {
                response.status(400).send("Database Update Error");
                return;
            }
            photo.save();
            response.status(200).send(photo);
        });
    });
});


// add new comment for a photo
app.post('/commentsOfPhoto/:photo_id', function (request, response) {
    if (!request.session || !request.session.user) {
        response.status(401).send("User hasn't signed in.");
        return;
    }
    const photoId = request.params.photo_id;
    Photo.findOne({
        _id: photoId
    }, function (err, photo) {
        if (err) {
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (photo.length === 0) {
            response.status(400).send("Invalid photo Id.");
            return;
        }
        let comment = request.body.comment;
        if (comment === undefined || comment.length === 0) {
            response.status(400).send("Comment is empty.");
            return;
        }
        let comments = photo.comments;
        comments.push({
            comment: comment,
            user_id: request.session.user._id
        });
        photo.set({comments: comments});
        photo.save(function (err) {
            if (err) {
                console.log(JSON.stringify(err));
            }
        });
        console.log(comments);
        let commentsCopy = JSON.parse(JSON.stringify(comments));
        async.each(commentsCopy, function (comment, comment_callback) {
            // process the user of the comment
            User.findOne({_id: comment.user_id}, function (err, userObj) {
                if (err) {
                    comment_callback(err);
                    return;
                } else if (userObj.length) {
                    console.log('User with _id:' + comment.user_id + ' not found.');
                    response.status(400).send('Not found');
                    return;
                }
                delete comment.user_id;
                comment["user"] = {
                    _id: userObj._id,
                    first_name: userObj.first_name,
                    last_name: userObj.last_name
                };
                comment_callback();
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                console.log(comments);
                response.status(200).send(JSON.stringify(commentsCopy));
            }
        });
    });
});


/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    // check if the user is logged in
    if (!request.session || !request.session.id || !request.session.user) {
        response.status(401).send("User hasn't signed in.");
        return;
    }

    User.find({}, function (err, list) {
        if (err) {
            console.error('Doing /user/list', err);
            response.status(500).send(JSON.stringify(err));
            return;
        } else if (list.length === 0) {
            console.log('User with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        let userList = [];
        list.forEach(function (obj) {
            let user = {
                _id: obj._id,
                first_name: obj.first_name,
                last_name: obj.last_name
            };
            userList.push(user);
        })
        response.status(200).send(JSON.stringify(userList));
    });
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    if (!request.session || !request.session.user) {
        response.status(401).send("User hasn't signed in.");
        return;
    }

    let id = request.params.id;
    if (!ObjectId.isValid(id)) {
        response.status(400).send('Invaild User Id.');
        return;
    }
    // useModelObj is a list of object even though it only has one
    // if we use findOne,then the userModelObj is an single object
    User.findOne({_id: id}, function (err, userModelObj) {
        if (err) {
            console.error('Doing /user/:id:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        } else if (userModelObj.length === 0) {
            console.log('User with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        let user = JSON.parse(JSON.stringify(userModelObj));
        delete user.login_name;
        delete user.password;
        delete user.__v;
        response.status(200).send(JSON.stringify(user));
    });
});


app.post('/photo/delete/:id', function (request, response) {
    if (!request.session || !request.session.user) {
        response.status(401).send("User hasn't signed in.");
        return;
    }
    let photoId = request.params.id;
    if (!ObjectId.isValid(id)) {
        response.status(400).send('Invaild Photo Id.');
        return;
    }
    Photo.remove({_id: photoId}, function (err) {
        if (err) {
            response.status(400).send('Delete photo with ID:' + id + 'not successfully.');
            return;
        }
    });
});

app.post('/comment/delete/:id', function (request, response) {
    if (!request.session || !request.session.user) {
        response.status(401).send("User hasn't signed in.");
        return;
    }
    let photoId = request.params.id;
    let commentId = request.body.commentId;
    if (!ObjectId.isValid(photoId)) {
        response.status(400).send('Invaild Photo Id.');
        return;
    }
    if (!ObjectId.isValid(commentId)) {
        response.status(400).send('Invaild Comment Id.');
        return;
    }
    Photo.findOne({_id: photoId}, function (err, photo) {
        if (err) {
            response.status(400).send('Delete photo with ID:' + id + 'not successfully.');
            return;
        }
        let idx = photo.comments.findIndex(function (comment) {
            return comment._id === commentId;
        });
        photo.comments.splice(idx, 1);
        photo.save(function (err) {
            console.log(JSON.stringify(err));
        });
    });
});

app.post('user/delete/:id', function (request, response) {
    request.session.destroy(function (err) {
        if (err) {
            response.status(400).send();
            return;
        } else {
            response.status(200).send();
            return;
        }
    });

    let id = request.params.id;
    User.findOne()
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    if (!request.session || !request.session.id || !request.session.user) {
        response.status(401).send("User hasn't signed in.");
        return;
    }
    let id = request.params.id;
    if (!ObjectId.isValid(id)) {
        response.status(400).send('Invaild User Id.');
        return;
    }
    Photo.find({user_id: id}, function (err, photosModelObj) {
        if (err) {
            console.error('Doing /photosOfUser/:id:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        } else if (photosModelObj.length === 0) {
            console.log('Photos for user with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        let photos = JSON.parse(JSON.stringify(photosModelObj));
        async.each(photos, function (photo, photo_callback) {
            delete photo.__v;
            if (photo.liked_users.indexOf(request.session.user._id) > -1) {
                photo.isLiked = true;
            } else {
                photo.isLiked = false;
            }
            delete photo.liked_users;
            // photo.date_time = photo.date_time.Format("yyyy-MM-dd hh:mm:ss");
            async.each(photo.comments, function (comment, comment_callback) {
                // process the user of the comment
                User.findOne({_id: comment.user_id}, function (err, userObj) {
                    if (err) {
                        comment_callback(err);
                        return;
                    } else if (userObj.length === 0) {
                        console.log('User with _id:' + comment.user_id + ' not found.');
                        response.status(400).send('Not found');
                        return;
                    }
                    delete comment.user_id;
                    comment["user"] = {
                        _id: userObj._id,
                        first_name: userObj.first_name,
                        last_name: userObj.last_name
                    };
                    comment_callback();
                });
            }, function (err) {
                if (err) {
                    response.status(500).send(JSON.stringify(err));
                }
                //一定要在这里callback
                photo_callback();
            });
            //这里photo callback就不行
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                response.status(200).send(JSON.stringify(photos));
            }
        });
    });
});


app.post('/like/:id', function (request, response) {
    if (!request.session || !request.session.user) {
        response.status(401).send("User hasn't signed in.");
        return;
    }
    let id = request.params.id;
    if (!ObjectId.isValid(id)) {
        response.status(400).send('Invaild Photo Id.');
        return;
    }
    const userId = request.session.user._id;
    Photo.findOne({
        _id: id,
    }, function (err, photo) {
        if (err) {
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (!photo) {
            response.status(400).send("Invaid photo Id.");
            return;
        }
        let isLiked = false;
        let likeList = photo.liked_users;
        const idx = likeList.indexOf(userId);
        if (idx > -1) {
            likeList.splice(idx, 1);
            photo.set({likes: photo.likes - 1, liked_users: likeList});
        } else {
            likeList.push(userId);
            photo.set({likes: photo.likes + 1, liked_users: likeList});
            isLiked = true;
        }
        photo.save();
        let like = {
            isLiked: isLiked,
            likes: photo.likes
        }
        response.status(200).send(JSON.stringify(like));
    });
});

if(process.env.NODE_ENV === 'production'){
    app.use(express.static('photo-sharing/build'));

    app.get('*', (request, response) => {
        response.sendFile(path.join(__dirname, 'photo-sharing', 'build', 'index.html'));
    });
}

app.listen(port, function () {
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});
