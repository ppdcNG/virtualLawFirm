var ABS_PATH = require('../config').ABS_PATH;

var admin = require("firebase-admin");

var serviceAccount = require("../config/firebaseservice.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://virtuallawfirm-2478e.firebaseio.com"
});

exports.adminPage = (req, res) => {
    res.render('admin/admin-dashboard', { title: 'Admin', ABS_PATH })
};

exports.loginPage = (req, res) => {
    res.render('admin/admin-login', { title: 'Admin', ABS_PATH })
};

exports.newUSer = (req, res) => {
    res.render('admin/new-user', { title: 'New user', ABS_PATH })
};

exports.adminLogin = async (req, res)=>{
    let token = req.body.idToken;
    console.log(token);
    let expiresIn = 60*60*24*5*1000;
    let sessionCookie = await admin.auth().createSessionCookie(token,{expiresIn});
    const options = {maxAge: expiresIn, httpOnly: true}
    res.cookie('session', sessionCookie,options);
    let response = {status: "success", message: "User Logged IN successfully"}
    res.send(response);
}

exports.createUser = async (req, res)=>{
    let {email, password} = req.body;
    if(!email && !password){
        let response = {status: "failed", message: "Invalid Parameters provided"}
        return;
    }
    try{
        let cred = {email, password}
        const user =  await admin.auth().createUser(cred);
        res.send(user);
    }
    catch(err){
        console.log(err);
        let obj = {err: err};

        res.send(obj);
    }
}


