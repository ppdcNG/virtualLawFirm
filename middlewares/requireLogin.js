
const admin = require('firebase-admin');
module.exports = async (req, res, next) => {
    let cookie = req.cookies.session;
    if (!cookie) {
        res.redirect('/');
        return;
    }

    try {
        let claims = await admin
            .auth()
            .verifySessionCookie(cookie, true);
        let user = await admin.auth().getUser(claims.uid);
        req.user = user;
        next();
    }
    catch (e) {
        console.log("user not logged in");
        return res.status(403).send({ message: "User Authentication Error", e });
    }

}