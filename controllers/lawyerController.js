exports.signupPage = (req, res) => {
    res.render('lawyer/register', { title: 'Lawyer register', name: 'Sadiq' })
};

exports.details = (req, res) => {
    res.render('lawyer/lawyer-details');
};

exports.login = (req, res) => {
    res.render('lawyer/login');
};
