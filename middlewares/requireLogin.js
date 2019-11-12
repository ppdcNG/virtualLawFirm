
const admin = require('firebase-admin');
module.exports = async (req, res, next) => {
    let cookie = req.cookies.session;
    if (!cookie) {
        res.redirect('/');
        return;
    }
    let claims = await admin
        .auth()
        .verifySessionCookie(cookie, true)
        .catch(e => {
            console.log("user not logged in");
            return res.status(403).send({ error: "You are not Logged Ins" });
        });
    let user = await admin.auth().getUser(claims.uid).catch(e => {
        return res.status(403).send({ error: "User Error.. User not found" });
    });
    req.user = user;
    next();
}