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

exports.signup = (req, res) => {
    let { email, firstname, lastname } = req.body;
    let data = { email, firstname, lastname };
    let tok = token();
    let user = await admin.auth().getUserByEmail(email).catch((e) => {
        let error = { err: e, message: e.message, status: 'failed' }
    });
    if (user) {

        res.send({
            err: "error",
            status: "failed",
            message: "A user with this email already exists"
        });
        return;
    }

    await admin.firestore().collection("lawyersTemp").doc(tok).set(data)
        .catch(e => {
            console.log(e.message);
        });

    let clickLink = ABS_PATH + "lawyer/confirm/?token=" + tok;
    let mailOptions = {
        name: `${firstname} ${lastname}`,
        link: clickLink,
        to: email
    };

    let sendgridOption = {
        to: email,
        from: "welcome@virtualLaw.com",
        subject: "Welcome to A & E Law firm",
        text: `Thank you for signing up this is your token ${tok}`
    };
    welcomeMail(mailOptions, res);
    res.send({ status: "success" });
}
