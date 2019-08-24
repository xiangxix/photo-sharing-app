const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../schema/user.js');

//register
router.post('/register', function (request, response) {

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
                const userCopy = {
                    _id : user._id,
                    first_name : user.first_name,
                    login_name : user.login_name,
                    avatar_url : user.avatar_url
                };
                request.session.user = userCopy;
                console.log("create new user successfully.");
                response.status(200).send(JSON.stringify(userCopy));
            });
        });
    });
});

//login
router.post('/login', function (request, response) {
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
            const userCopy = {
                _id : user._id,
                first_name : user.first_name,
                login_name : user.login_name,
                avatar_url : user.avatar_url
            };
            request.session.user = userCopy;
            response.status(200).send(JSON.stringify(userCopy));
        }
    });
});

router.get('/login-user', function(request, response) {
	if (!request.session || !request.session.user) {
		response.status(401).send("User hasn't signed in.");
		return;
	}
	let user = {
	    _id : request.session.user._id,
      first_name : request.session.user.first_name,
      login_name : request.session.user.login_name,
      avatar_url : request.session.user.avatar_url
	};
	response.status(200).send(JSON.stringify(user));
});

//logout
router.post('/logout', function (request, response) {
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

module.exports = router;