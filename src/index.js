require('dotenv').config()

const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const api = require('./api')
const cors = require('@koa/cors')

const mongoose = require('mongoose')
const session = require('koa-session')

const {
  PORT: port = 4000,
  MONGO_URI: mongoURI,
  COOKIE_SIGN_KEY: signKey
} = process.env

mongoose.Promise = global.Promise
mongoose.connect(mongoURI, { useNewUrlParser: true }).then(
    console.log('connected to mongodb')
).catch((e) => {
    console.error(e)
})

const app = new Koa()
app.use(cors({
  origin: '*', 
  credentials: true
}))

const router = new Router()
// Setting router
router.use('/api', api.routes()) // Set api routing 


// Use bodyParser before the router
app.use(bodyParser())

// Session Key
const sessionConfig = {
  maxAge: 86400000
}

app.use(session(sessionConfig, app))
app.keys = [signKey]

// Apply router in app instance
app.use(router.routes()).use(router.allowedMethods())

app.listen(port, () => {
    console.log('listening to port', port)
})
