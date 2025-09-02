/* eslint-disable no-console */
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');


const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('morgan');


// MIDDLEWARE (move to top)
app.use(cors());
app.use(express.json());
app.use(logger('dev'));

// Controllers
const authRouter = require('./controllers/auth');
const userRouter = require('./controllers/users');
const profileRouter = require('./controllers/profile');
const postRouter = require('./controllers/posts');
const commentRouter = require('./controllers/comment');
const privateChatRouter = require('./controllers/privateChats');
const formulaRouter = require('./routes/formula');

// Routes
app.use('/formulas', formulaRouter);
app.use('/auth', authRouter);
app.use('/posts', postRouter);
app.use('/comments', commentRouter);
app.use('/users', userRouter);
app.use('/profile', profileRouter);
app.use('/chats', privateChatRouter);

// Middleware
const verifyToken = require('./middleware/verify-token');

// DB Connection
mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.listen(3000, () => {
  console.log('The express app is ready!');
});
