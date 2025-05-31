require('./controllers/passport');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const { globalErrorHandler } = require('./utils/globalErrorHandler');
const passport = require('passport');
const { PORT, FRONTEND_URL } = require('./configs');
const connectDB = require('./database/index');

connectDB();

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(passport.initialize());

//middlewares
app.use(
  cors({
    origin: FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
//Routes
app.use('/uploads', express.static('uploads'));
app.use('/', require('./routes'));

// Error handling middleware
app.use(globalErrorHandler);

//Server
app.listen(PORT, () => {
  console.log(`App listening on the port ${PORT}`);
});
