const sendgrid = require("@sendgrid/mail");
const SENDGRID_API_KEY = require("../config/dev").SEND_GRID_API_KEY;
var ABS_PATH = require("../config").ABS_PATH;
const { welcomeEmail } = require("../views/templates/welcome");
const { clientInvite } = require("../views/templates/clientInvite");

sendgrid.setApiKey(SENDGRID_API_KEY);

exports.sendmail = message => {
  sendgrid.send(message);
};

exports.welcomeMail = (options, res) => {
  let { name, link, to } = options;
  let templateOptions = {
    ABS: ABS_PATH,
    name,
    link
  };
  let html = welcomeEmail(templateOptions).toString();
  let messageOptions = {
    to,
    subject: "Welcome To A $ E Law",
    from: "lawyer@virtualLaw.com",
    text: "Welcome to A & E Law",
    html
  };

  sendgrid.send(messageOptions).catch(e => {
    console.log(e);
    console.log(e.message);
  });
};

exports.inviteEmail = async (email) => {
  let html = clientInvite(ABS_PATH).toString()
  let messageOptions = {
    to: email,
    subject: "Welcome to LawTrella",
    from: "info@lawtrella.com",
    text: "Welcome to LawTrella",
    html
  }
  await sendgrid.send(messageOptions).catch(e => {
    console.log(e.message);
  })
}
