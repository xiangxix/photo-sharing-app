"use strict";
/*
 *  Defined the Mongoose Schema and return a Model for a User
 */
/* jshint node: true */

const mongoose = require('mongoose');

// create a schema
const userSchema = new mongoose.Schema({
	login_name: String, // first name of the login user.
	// password: String, // the password for the user.
	salt: String,
	password_digest: String,
    first_name: String, // First name of the user.
    last_name: String,  // Last name of the user.
    location: String,    // Location  of the user.
    description: String,  // A brief user description
    occupation: String,   // Occupation of the user.
    avatar_url: {type:String, default:"https://res.cloudinary.com/hqcelqc7l/image/upload/v1566255805/avatar/defaultAvatar.jpg"}
});

// the schema is useless so far
// we need to create a model using it
const User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
