const express = require('express');
const router = express.Router();
const User = require('../schema/user.js');
const ObjectId = require('mongodb').ObjectID;


// user list
router.get('/list', function (request, response) {
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
                last_name: obj.last_name,
                avatar_url: obj.avatar_url
            };
            userList.push(user);
        });
        response.status(200).send(JSON.stringify(userList));
    });
});

// user detail
router.get('/:id', function (request, response) {
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
        delete user.password_digest;
        delete user.salt;
        delete user.__v;
        response.status(200).send(JSON.stringify(user));
    });
});


module.exports = router;

