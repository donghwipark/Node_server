const { ObjectId } = require('mongoose').Types

exports.checkObjectId = (ctx, next) => {
    const { id } = ctx.params

    // Authorise fail
    if(!ObjectId.isValid(id)) {
        ctx.status = 400 // 400 Bad request
        return null
    }

    return next() // Can set ctx.body properly after return next
}

const Post = require('models/post')
const Joi = require('joi')

exports.write = async (ctx) => {
    // check the value which is not a object
    const schema = Joi.object().keys({
        title: Joi.string().required(), // required() means the must input 
        body: Joi.string().required(),
        tags: Joi.array().items(Joi.string()).required()
    })

    // First parameter is object to check, second is the schema
    const result = Joi.validate(ctx.request.body, schema)

    // response on error
    if(result.error) {
        ctx.status = 400
        ctx.body = result.error
        return
    }

    const { title, body, tags } = ctx.request.body

    // Make New Post instance
    const post = new Post({
        title, body, tags
    })

    try {
        await post.save()
        ctx.body = post
    } catch(e) {
        // error on database
        ctx.throw(e, 500)
    }
}

exports.list = async (ctx) => {
    // If there is no page, reply with 1
    // Change to number from string
    const page = parseInt(ctx.query.page || 1, 10)
    const { tag } = ctx.query

    const query = tag ? {
        tags: tag // Find post who has tag in tags
    } : {}

    // On page mistake
    if(page < 1) {
        ctx.status = 400
        return
    }
    try {
        const posts = await Post.find(query)
            .sort({_id: -1})
            .limit(10)
            .skip((page - 1) * 10)
            .lean()
            .exec()
        const postCount = await Post.countDocuments(query).exec()
        // tell last page
        // Set ctx.set on response header
        const limitBodyLength = post => ({
            ...post,
            body: post.body.length < 350 ? post.body : `${post.body.slice(0, 350)}...`
        })
        ctx.body = posts.map(limitBodyLength)
        ctx.set('Last-Page', Math.ceil(postCount / 10))
    } catch(e) {
        ctx.throw(500, e)
    }
}

exports.read = async (ctx) => {
    const { id } = ctx.params
    try {
        const post = await Post.findById(id).exec()
        // There are no post
        if(!post) {
            ctx.status = 404
            return
        }
        ctx.body = post
    } catch(e) {
        ctx.throw(500, e)
    }
}

exports.remove = async (ctx) => {
    const { id } = ctx.params
    try {
        await Post.findByIdAndRemove(id).exec()
        ctx.status = 204
    } catch(e) {
        ctx.throw(500, e)
    }
}

exports.update = async (ctx) => {
    const { id } = ctx.params
    try {
        const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
            new: true
            // Can resend object on this setting
            // If didn't set up, resend the object before upgrade
        }).exec()
        // if there are no Post
        if(!post) {
            ctx.status = 404
            return
        }
        ctx.body = post
    } catch(e) {
        ctx.throw(500, e)
    }
}

exports.checkLogin = (ctx, next) => {
    if(!ctx.session.logged) {
        ctx.status = 401; // Unauthorized
        return null;
    }
    return next()
}
