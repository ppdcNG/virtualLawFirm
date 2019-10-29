var admin = require("firebase-admin");

var serviceAccount = require("../config/firebaseservice.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://virtuallawfirm-2478e.firebaseio.com"
});





exports.adminPage = (req, res) => {
    res.render('admin/admin-dashboard', { title: 'Admin' })
};

exports.adminLogin = async (req, res)=>{
    let token = req.idToken;
    console.log(token);
    let expiresIn = 60*60*24*5*1000;
    let sessionCookie = await admin.auth().createSessionCookie(token,{expiresIn});
    const options = {maxAge: expiresIn, httpOnly: true}
    res.cookie('session', sessionCookie,options);
    let response = {status: "success", message: "User Logged IN success fully"}
    res.send(response);
}

exports.createUser = (req, res)=>{
    let {username, password} = req.body;
    if(!username && !password){
        let response = {status: "failed", message: "Invalid Parameters provided"}
        return;
    }
    try{
        let cred = {username, password}
        const user =  await admin.auth().createUser(cred);
        res.send(user);
    }
    catch(err){
        console.log(err);
        res.send(err)
    }
}


