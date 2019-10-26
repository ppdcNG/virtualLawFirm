var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: "A&E VL",
    path: "/"
  });
});

router.get('/join', function (req, res) {
  res.render('auth/join', {
    path: "/join"
  })
});


module.exports = router;
