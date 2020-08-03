var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mustacheExpress = require('mustache-express');
var admin = require("firebase-admin");
var serviceAccount = process.env.NODE_ENV === "production" ? require('./config/firebase-prod').serviceAccount : require("./config/firebaseservice.json");

var fileUpload = require('express-fileupload')
var databaseURL = process.env.NODE_ENV === 'production' ? "https://lawtrella-prod.firebaseio.com" : "https://virtuallawfirm-2478e.firebaseio.com";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL
});

const indexRouter = require('./routes/index');
const adminRoutes = require('./routes/admin.js');
const clientRoutes = require('./routes/client');
const lawyerRoutes = require('./routes/lawyers');
const eLearningRoutes = require('./routes/eLearning');
const termsRoutes = require('./routes/terms');

var app = express();

// view engine setup
const views_path = path.join(__dirname, '/views');
app.engine('mustache', mustacheExpress(views_path + '/layout', '.mustache'))
app.set('views', views_path);

app.set('view engine', 'mustache');


app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));
app.use(fileUpload());

app.use('/', indexRouter);
app.use('/admin', adminRoutes);
app.use('/client', clientRoutes);
app.use('/lawyer', lawyerRoutes);
app.use('/e-learning', eLearningRoutes);
app.use('/', termsRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
app.get('/', function (req, res) {
  res.send('Hello World!')
})
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    if (req.headers['x-forwarded-proto'] !== 'https')
      return res.redirect('https://' + req.headers.host + req.url);
    else
      return next();
  } else
    return next();
});

module.exports = app;
