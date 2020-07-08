const { ABS_PATH, AppName } = require("../config");

exports.privacyPolicy = (req, res) => {
    res.render('terms/privacy-policy', { title: 'Privacy Policy', AppName })
};
