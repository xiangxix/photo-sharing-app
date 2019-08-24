const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const async = require('async');
const User = require('../schema/user.js');
const Photo = require('../schema/photo');


// new comment 
router.post('/new/:photo_id', function (request, response) {
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
                comment.date_time = new Date(comment.date_time).Format('yyyy-MM-dd hh:mm:ss');
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
                response.status(200).send(JSON.stringify(commentsCopy));
            }
        });
    });
});

// delete comment for photo with parameter id
router.post('/delete/:id', function (request, response) {
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
        let commentsCopy = JSON.parse(JSON.stringify(photo.comments));
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

                comment.date_time = new Date(comment.date_time).Format('yyyy-MM-dd hh:mm:ss');
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
                response.status(200).send(JSON.stringify(commentsCopy));
            }});
    });
});
module.exports = router;