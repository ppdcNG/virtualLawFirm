const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
var sendmail = require("../helpers/mail").sendmail;
var admin = require("firebase-admin");
const requireLogin = require('../middlewares/requireLogin');

router.get("/", requireLogin, adminController.adminPage);
router.post("/auth", adminController.adminLogin);
router.post("/createUser", adminController.createUser);

router.get("/login", adminController.loginPage);
router.get("/newUser", adminController.newUSer);
router.post("/fetchLawyers", adminController.fetchLawyers);
router.get('/details', adminController.details);

router.post("/testmail", (req, res) => {
  const message = req.body;
  console.log(message);
  sendmail(message);
});
router.post("/sendLawyerInvite", adminController.sendLawyerInvite);

router.post('/verifyLawyerEmail', adminController.verifyLawyerEmail);
router.post('/verifyUserEmail', adminController.verifyUserEmail);
router.post('/verifyLawyer', adminController.verifyLawyer);

module.exports = router;
