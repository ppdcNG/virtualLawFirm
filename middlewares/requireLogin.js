
const admin = require('firebase-admin');
module.exports = async (req, res, next) => {
    let cookie = req.cookies.session;
    let claims = await admin
        .auth()
        .verifySessionCookie(cookie, true)
        .catch(e => {
            return res.status(403).send({ error: "You are not Logged Ins" });
        });
    let user = await admin.auth().getUser(claims.uid).catch(e => {
        return res.status(403).send({ error: "User Error.. User not found" });
    });
    req.user = user;
    next();
}