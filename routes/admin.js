const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
var sendmail = require("../helpers/mail").sendmail;

router.get("/", adminController.adminPage);
router.post("/auth", adminController.adminLogin);
router.post("/createUser", adminController.createUser);

router.get("/login", adminController.loginPage);
router.get("/newUser", adminController.newUSer);

router.post("/testmail", (req, res) => {
  const message = req.body;
  console.log(message);
  sendmail(message);
});
router.post("/sendLawyerInvite", adminController.sendLawyerInvite);

module.exports = router;
