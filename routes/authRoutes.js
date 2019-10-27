

var admin = require("firebase-admin");

var serviceAccount = require("../keys/firebaseservice.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://virtuallawfirm-2478e.firebaseio.com"
});

module.exports = (app)=>{

    app.post('/auth/signup', async (req, res)=>{
        let body = req.body;
        console.log(body);
        res.send(body)
        try{
            const user =  await admin.auth().createUser(body);
            res.send(user);
        }
        catch(err){
            console.log(err);
            res.send()
        }

    });
}