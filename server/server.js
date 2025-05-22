require('./controllers/passport');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { globalErrorHandler } = require('./utils/globalErrorHandler');
const passport = require('passport');
const { PORT } = require('./configs');
const connectDB = require('./database/index');

connectDB();

const app = express();

//middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

//Routes
app.use('/', require('./routes'));

// Error handling middleware
app.use(globalErrorHandler);

//Server
app.listen(PORT, () => {
  console.log(`App listening on the port ${PORT}`);
});
