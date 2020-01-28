var express = require('express');
var router = express.Router();

const AppName = require("../config").AppName;

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: "A&E VL",
    path: "/",
    AppName
  });
});

router.get('/join', function (req, res) {
  res.render('auth/join', {
    path: "/join"
  })
});

router.get('/logout', (req, res) => {
  res.clearCookie('session');
  res.redirect('/');
})


module.exports = router;
