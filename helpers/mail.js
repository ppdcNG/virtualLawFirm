const sendgrid = require("@sendgrid/mail");
const SENDGRID_API_KEY = process.env.NODE_ENV == 'production' ? process.env.SEND_GRID_API_KEY : require("../config/dev").SEND_GRID_API_KEY
const MAILGUN_API_KEY = process.env.NODE_ENV == 'production' ? process.env.MAILGUN_API_KEY : require('../config/dev').MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.NODE_ENV == 'production' ? process.env.MAILGUN_DOMAIN : require('../config/dev').MAILGUN_DOMAIN;
var Mailgun = require('mailgun-js');

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

exports.notifyMail = (options, res) => {

  let html = notify(options).toString();
  let messageOptions = {
    to: "admin@lawtrella.com",
    subject: "Course Creation Request",
    from: "Lawtrella <no-reply@lawtrella.com>",
    text: "Course Creation to Lawtrella",
    html
  };

  let mailgun = new Mailgun({ apiKey: MAILGUN_API_KEY, domain: MAILGUN_DOMAIN })

  mailgun.messages().send(messageOptions, function (err, body) {
    console.log(body);
    if (err) {
      console.log(err);
      res.status(304).send({ status: 'failed', err: err, message: err.message });
      return;
    }
    res.send({ status: "success" });
  })
}

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
    subject: "Welcome To Lawtrella",
    from: "Lawtrella <welcome@lawtrella.com>",
    text: "Welcome to Lawtrella",
    html
  };

  let mailgun = new Mailgun({ apiKey: MAILGUN_API_KEY, domain: MAILGUN_DOMAIN })

  mailgun.messages().send(messageOptions, function (err, body) {
    console.log(body);
    if (err) {
      console.log(err);
      res.status(304).send({ status: 'failed', err: err, message: err.message });
      return;
    }
    res.send({ status: "success" });
  })
};

exports.inviteEmail = async (email) => {
  let html = clientInvite(ABS_PATH).toString()
  let messageOptions = {
    to: email,
    subject: "Welcome to Lawtrella",
    from: "Lawtrella <info@lawtrella.com>",
    text: "Welcome to Lawtrella",
    html
  }

  let mailgun = new Mailgun({ apiKey: MAILGUN_API_KEY, domain: MAILGUN_DOMAIN })
  mailgun.messages().send(messageOptions, function (err, body) {
    console.log(body);
    if (err) {
      console.log(err);
      res.status(304).send({ status: 'failed', err: err, message: err.message });
      return;
    }
    res.send({ status: "success", message: `Invite has been sent` });
  })
}

exports.sendAdminNewCase = async (email, lawyerName, clientName) => {
  let html = adminCase(ABS_PATH, lawyerName, clientName);
  let messageOptions = {
    to: email,
    subject: "New Case Alert",
    from: 'Lawtrella <info@lawtrella.com>',
    text: `A new Case from ${clientName} has been assigned to ${lawyerName}`,
    html
  }

  let response = await sendgrid.send(messageOptions).catch(e => {
    console.log(e);
  });
  let mailgun = new Mailgun({ apiKey: MAILGUN_API_KEY, domain: MAILGUN_DOMAIN })
  mailgun.messages().send(messageOptions, function (err, body) {
    console.log(body);
    if (err) {
      console.log(err);
      res.status(304).send({ status: 'failed', err: err, message: err.message });
      return;
    }
    res.send({ status: "success", message: `A new Case from ${clientName} has been assigned to ${lawyerName}` });
  })

  console.log(response);

}
exports.askLawyerMail = async (email, clientName, res) => {
  let options = {
    title: `${clientName} wants to Ask a Lawyer`,
    message: "A client needs to ask you a question; login as admin to chat with client"
  }
  let html = notify(options);
  let messageOptions = {
    to: email,
    subject: "Lawtrella Ask a Lawyer",
    from: 'Lawtrella <admin@lawtrella.com>',
    text: `A client needs to ask you a question; Login as admin to chat with client`,
    html
  }
  let mailgun = new Mailgun({ apiKey: MAILGUN_API_KEY, domain: MAILGUN_DOMAIN });
  mailgun.messages().send(messageOptions, function (err, body) {
    console.log(body);
    if (err) {
      console.log(err);
      res.status(304).send({ status: 'failed', err: err, message: err.message });
      return;
    }
    res.send({ status: "success", message: "mail sent and chat initiated" });
  })


}

exports.forgotPasswordMail = async (email, name, token, res) => {
  let option = {
    image: ABS_PATH + `images/lock.jpeg`,
    link: ABS_PATH + `resetPassword?token=${token}`,
    name, email
  }
  let html = resetPassword(option)
  let messageOptions = {
    to: email,
    subject: "Password Recovery",
    from: 'Lawtrella <recovery@lawtrella.com>',
    text: `follow this link "${option.link} to reset your password`,
    html
  }

  let mailgun = new Mailgun({ apiKey: MAILGUN_API_KEY, domain: MAILGUN_DOMAIN })

  mailgun.messages().send(messageOptions, function (err, body) {
    console.log(body);
    if (err) {
      console.log(err);
      res.status(304).send({ status: 'failed', err: err, message: err.message });
      return;
    }
    res.send({ status: "success" });
  })


}
