exports.clientLandingPage = (req, res) => {
    res.render('client/client-landing', { title: 'Client page' })
};

exports.registrationPage = (req, res) => {
    res.render('auth/client-join', {title: 'Register'})
};

exports.legalDocsPage = (req, res) => {
    res.render('client/legal-docs', {title: 'Legal Documents'})
}