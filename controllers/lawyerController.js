var ABS_PATH = require("../config").ABS_PATH;

exports.signupPage = (req, res) => {
    res.render("lawyer/register", { title: "Lawyer register", name: "Sadiq", ABS_PATH });
};

exports.details = (req, res) => {
    res.render("lawyer/lawyer-details", { ABS_PATH });
};

exports.login = (req, res) => {
    res.render("lawyer/login", { ABS_PATH });
};

exports.confirm = (req, res) => {
    res.render("lawyer/lawyer-confirm", { token: req.query.token, ABS_PATH });
    console.log(req);
};
