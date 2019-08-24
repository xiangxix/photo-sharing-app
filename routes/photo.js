const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const async = require('async');
const fs = require('fs');

const cloudinary = require('cloudinary').v2;
if (! process.env.CLOUDINARY_URL) {
    cloudinary.config({
        cloud_name: 'hqcelqc7l',
        api_key: '393273825745427',
        api_secret: 'Hnpd4I-mkEHhaTs-djncH3stcbk'
    });
}
const multer = require('multer');
const upload = multer({storage: multer.diskStorage({})}).single('uploadedphoto');

const Photo = require('../schema/photo.js');
const User = require('../schema/user.js');

router.post('/new', function (request, response) {
    if (!request.session || !request.session.user) {
        response.status(401).send("User hasn't signed in.");
        return;
    }

    upload(request, response, function (err) {
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
        const description = request.body.postText;
        //use cloudinary API to upload photo, set multer storage to disk to use file.path
        cloudinary.uploader.upload(request.file.path,
        {public_id:filename, folder:"UserPhotos"}, function(err, result) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
                return;
            }
            fs.unlinkSync(request.file.path);
            Photo.create({
                url: result.url,
                public_id: result.public_id,
                user_id: request.session.user._id,
                description:description,
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
});

router.post('/delete/:id', function (request, response) {
    if (!request.session || !request.session.user) {
        response.status(401).send("User hasn't signed in.");
        return;
    }
    const photoId = request.params.id;
    const publicId = request.body.public_id;
    if (!ObjectId.isValid(photoId)) {
        response.status(400).send('Invaild Photo Id.');
        return;
    }
    Photo.deleteOne({_id: photoId}, function (err, photo) {
        if (err) {
            response.status(400).send('Delete photo with ID:' + id + 'not successfully.');
            return;
        }
        if (photo.user_id !== request.session.user_id) {
            response.status(400).send('Can not delete a photo that do not belongs to you!');
            return;
        }
        cloudinary.uploader.destroy(publicId, function(err, result) {
            if (err) {
                response.status(400).send('Delete error');
                return;
            }
            response.status(200).send("Delete photo successfully!");
        })
    });
});

// router.get('/timeline',function (request, response) {
//     Photo.find({}).sort({date_time:-1});
// });

router.get('/timeline',function (request, response) {
    if (!request.session || !request.session.id || !request.session.user) {
        response.status(401).send("User hasn't signed in.");
        return;
    }
    Photo.find({}).sort({date_time:-1}).exec(function (err, photosModelObj) {
        if (err) {
            console.error('Doing /photosOfUser/:id:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        } else if (photosModelObj.length === 0) {
            console.log('Photos for user with _id:' + id + ' not found.');
            response.status(200).send(JSON.stringify([]));
            return;
        }
        let photos = JSON.parse(JSON.stringify(photosModelObj));
        async.each(photos, function (photo, photo_callback) {
            delete photo.__v;
            photo.date_time = new Date(photo.date_time).Format('yyyy-MM-dd hh:mm:ss');
            if (photo.liked_users.indexOf(request.session.user._id) > -1) {
                photo.isLiked = true;
            } else {
                photo.isLiked = false;
            }
            delete photo.liked_users;
            User.findOne({_id: photo.user_id}, function (err, userObj) {
                if (err) {
                    response.status(400).send('Not found');
                    return;
                } else if (userObj.length === 0) {
                    console.log('User with _id:' + comment.user_id + ' not found.');
                    response.status(400).send('Not found');
                    return;
                }
                delete photo.user_id;
                photo["user"] = {
                    _id: userObj._id,
                    first_name: userObj.first_name,
                    last_name: userObj.last_name,
                    avatar_url: userObj.avatar_url,
                };
            });
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

// get the photo array for user with id
router.get('/:id', function (request, response) {
    if (!request.session || !request.session.id || !request.session.user) {
        response.status(401).send("User hasn't signed in.");
        return;
    }
    let id = request.params.id;
    if (!ObjectId.isValid(id)) {
        response.status(400).send('Invalid User Id.');
        return;
    }
    Photo.find({user_id: id}, function (err, photosModelObj) {
        if (err) {
            console.error('Doing /photosOfUser/:id:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        } else if (photosModelObj.length === 0) {
            console.log('Photos for user with _id:' + id + ' not found.');
            response.status(200).send(JSON.stringify([]));
            return;
        }
        let photos = JSON.parse(JSON.stringify(photosModelObj));
        async.each(photos, function (photo, photo_callback) {
            delete photo.__v;
            photo.date_time = new Date(photo.date_time).Format('yyyy-MM-dd hh:mm:ss');
            if (photo.liked_users.indexOf(request.session.user._id) > -1) {
                photo.isLiked = true;
            } else {
                photo.isLiked = false;
            }
            delete photo.liked_users;
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

// handle the likes of photo
router.post('/like/:id', function (request, response) {
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
        };
        response.status(200).send(JSON.stringify(like));
    });
});


module.exports = router;