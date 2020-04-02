const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
var sendmail = require("../helpers/mail").sendmail;
var admin = require("firebase-admin");
const requireLogin = require('../middlewares/requireLogin');
const requireAdmin = require('../middlewares/requireAdmin');
const requireLawyer = require('../middlewares/requireLawyer');

router.get("/", requireAdmin, adminController.adminPage);
router.post("/auth", adminController.adminLogin);
router.post("/createUser", adminController.createUser);

router.get("/login", adminController.loginPage);
router.get("/newUser", requireAdmin, adminController.newUSer);
router.post("/fetchLawyers", adminController.fetchLawyers);
router.get('/details', requireAdmin, adminController.details);
router.get('/addAdminUser', adminController.addAdminUser);

router.post("/testmail", (req, res) => {
  const message = req.body;
  console.log(message);
  sendmail(message);
});
router.post("/sendLawyerInvite", adminController.sendLawyerInvite);

router.post('/verifyLawyerEmail', adminController.verifyLawyerEmail);
router.post('/verifyUserEmail', adminController.verifyUserEmail);
router.post('/verifyLawyer', adminController.verifyLawyer);
router.get('/downloadLegalDoc', adminController.downloadDoc);
router.get('/videoChat', requireLogin, adminController.videoCall);

module.exports = router;
