"use strict";

/*
 * Defined the Mongoose Schema and return a Model for a Photo
 */

/* jshint node: true */

const mongoose = require('mongoose');

/*
 * Photo can have comments and we stored them in the Photo object itself using
 * this Schema:
 */
const commentSchema = new mongoose.Schema({
    comment: String,     // The text of the comment.
    date_time: {type:Date, default: Date.now}, // The date and time when the comment was created.
    user_id: mongoose.Schema.Types.ObjectId,    // 	The ID of the user who created the comment.
});

// create a schema for Photo
const photoSchema = new mongoose.Schema({
    url: String, // 	url of a file containing the actual photo (in the directory project6/images).
    public_id: String,
    description: String,
    date_time: {type:Date, default: Date.now}, // 	The date and time when the photo was added to the database
    user_id: mongoose.Schema.Types.ObjectId, // The ID of the user who created the photo.
    comments: [commentSchema], // Array of comment objects representing the comments made on this photo.
    likes: {type:Number,  default:0},// the number of likes associated with the photo
    liked_users:{type:[mongoose.Schema.Types.ObjectId], default:[]} // Array of the users who create the like
});

// the schema is useless so far
// we need to create a model using it
const Photo = mongoose.model('Photo', photoSchema);

// make this available to our photos in our Node applications
module.exports = Photo;
