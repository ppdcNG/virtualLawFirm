const { ABS_PATH, AppName } = require("../config");

exports.privacyPolicy = (req, res) => {
    res.render('terms/privacy-policy', { title: 'Privacy Policy', AppName })
};

exports.termsOfUse = (req, res) => {
    res.render('terms/terms-ofUse', { title: 'Terms Of Use', AppName });
};

exports.lawyerTerms = (req, res) => {
    res.render('terms/lawyer-terms', { title: 'Lawyer Terms Of Use', AppName });
};