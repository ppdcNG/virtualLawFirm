const { ABS_PATH, AppName } = require("../config");


exports.notaryPublic = (req, res) => {
    res.render('notary-public', { title: 'Notary Public', AppName })
};

