const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');const cors = require('cors');
require('dotenv').config();
 
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const recipesRouter = require('./routes/recipes');
const reviewsRouter = require('./routes/reviews');
 
const app = express();
 
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection failed:', err.message));
 
app.use(cors({
  origin: true,
  credentials: true
}));
 
app.use(logger('dev'));
 
app.use(express.json());
 
app.use(express.urlencoded({ extended: false }));
 
app.use(cookieParser());
 
app.use(express.static(path.join(__dirname, 'public')));
 
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true
  }
}));
 
app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/reviews', reviewsRouter);
 
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});
 
module.exports = app;