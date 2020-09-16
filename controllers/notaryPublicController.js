const { ABS_PATH, AppName } = require("../config");
const { notaryPublic } = require("../helpers");

exports.notaryPublic = (req, res) => {
    res.render('notary-public', { title: 'Notary Public', AppName, notaryPublic });
};

