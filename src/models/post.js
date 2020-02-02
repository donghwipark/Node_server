const mongoose = require('mongoose')

const { Schema } = mongoose

const Post = new Schema({
    title: String,
    body: String,
    tags: [String], // String array
    publishedDate: {
        type: Date,
        default: new Date() // Set current date as default
    }
})

module.exports = mongoose.model('Post', Post)
