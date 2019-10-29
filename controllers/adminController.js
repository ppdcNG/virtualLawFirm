exports.adminPage = (req, res) => {
    res.render('admin/admin-dashboard', { title: 'Admin' })
};

exports.adminLogin = (req, res) => {
    res.render('admin/admin-login', { title: 'Admin Login' })
};

exports.adminLoginAuth = (req, res) => {
    let admin = {
        username: req.body.uname,
        password: req.body.pwd,
    }
    res.json({
        message: 'logging in as admin'
    })
    // res.redir('/admin')
}

exports.lawyerDetails = (req, res) => {
    res.json({
        status: 200,
        message: 'lawyer details'
    })
};
