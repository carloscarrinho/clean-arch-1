export default {
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/clean-node-api',
  port: process.env.PORT || 3333,
  secret: process.env.APP_SECRET || 'app-secret'
}
