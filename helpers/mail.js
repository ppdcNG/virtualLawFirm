const sendgrid = require("@sendgrid/mail");
const SENDGRID_API_KEY = process.env.NODE_ENV == 'production' ? process.env.SEND_GRID_API_KEY : require("../config/dev").SEND_GRID_API_KEY
var ABS_PATH = require("../config").ABS_PATH;
const { welcomeEmail } = require("../views/templates/welcome");
const { clientInvite } = require("../views/templates/clientInvite");
const { adminCase } = require('../views/templates/adminCase');
const { resetPassword } = require('../views/templates/resetpass');
const { notify } = require('../views/templates/notify');

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
    subject: "Welcome To LawTrella",
    from: "welcome@lawtrella.com",
    text: "Welcome to Lawtrella",
    html
  };

  return sendgrid.send(messageOptions);
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

exports.sendAdminNewCase = async (email, lawyerName, clientName) => {
  let html = adminCase(ABS_PATH, lawyerName, clientName);
  let messageOptions = {
    to: email,
    subject: "New Case Alert",
    from: 'info@lawtrella.com',
    text: `A new Case from ${clientName} has been assigned to ${lawyerName}`,
    html
  }

  let response = await sendgrid.send(messageOptions).catch(e => {
    console.log(e);
  });

  console.log(response);

}
exports.askLawyerMail = async (email, clientName) => {
  let options = {
    title: `${clientName} wants to Ask a Lawyer`,
    message: "A client needs to ask you a question; login as admin to chat with client"
  }
  let html = notify(options);
  let messageOptions = {
    to: email,
    subject: "Lawtrella Ask a Lawyer",
    from: 'info@lawtrella.com',
    text: `A client needs to ask you a question; Login as admin to chat with client`,
    html
  }

  let response = await sendgrid.send(messageOptions).catch(e => {
    console.log(e);
  });


}

exports.forgotPasswordMail = async (email, token) => {
  let option = {
    ABS: ABS_PATH,
    link: ABS_PATH + `resetPassword?token=${token}`
  }
  let html = resetPassword(option)
  let messageOptions = {
    to: email,
    subject: "Password Recovery",
    from: 'recovery@lawtrella.com',
    text: `follow this link "${option.link} to reset your password`,
    html
  }
  console.log(messageOptions)
  try {
    let response = await sendgrid.send(messageOptions);
    return true;
  }
  catch (e) {
    console.log(e);
    return false;

  }


}
