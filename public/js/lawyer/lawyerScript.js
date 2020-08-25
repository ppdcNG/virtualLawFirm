$("#laywerConfirm").submit(function (e) {
  e.preventDefault();

  var form = form2js("laywerConfirm", ".");
  if (form.password !== form.confirmPassword) {
    $.notify("Passwords do not match", { type: "warning", z_index: 5000 });
    $("#confirmError").html("Passwords do not match");
    $("#confirmError").removeClass('valid');
    $("#password").addClass('is-invalid');
    $("#confirmPassword").addClass('is-invalid');
    clearLoad('continue', 'CREATE MY ACCOUNT');

    return false;
  }

  $(this)[0].reset();
  buttonLoad('continue');
  $("#lawyerGotIt").click(dismiss);
  $("#gotsignup").click(dismiss);

  function dismiss(type) {
    console.log('clear called');
    if (type == 'recover') {
      $("#recoverForm").fadeIn();
      $("#forgotModal").modal('hide');
      $("#recoverComplete").addClass('recover-success');
    }

    if (type == 'signup') {

      $("#lawyerRegisterForm").fadeIn();
      $("#lawyerSignupComplete").addClass('signup-success');
      $("#lawyerLoginModal").modal('show');
    }
  }

  $.ajax({
    url: ABS_PATH + "admin/verifyLawyerEmail",
    data: form,
    type: "POST",
    success: function (response) {
      console.log(response);
      if (!response.err) {
        $.notify(response.message, { type: "success", z_index: 5000 });
        $("#laywerConfirm").hide();

        $("#recoverComplete").removeClass('signup-success');
        $.notify("Please Wait...", { z_index: 5000 });

        signIn(response.email, form.password, () => { window.location = ABS_PATH });
      } else {
        $.notify(response.message, { type: "warning", z_index: 5000 });
        $("#confirmError").html(response.message);
        $("#confirmError").removeClass('valid');
        clearLoad('continue', 'CREATE MY ACCOUNT');
      }
    },
    error: e => {
      console.log(e);
      clearLoad('continue', 'CREATE MY ACCOUNT');
    }
  });
});

$("#lawyerLoginForm").submit(function (e) {
  e.preventDefault();
  let form = form2js("lawyerLoginForm", ".");

  let { email, password } = form;

  signIn(email, password);
});
var uservar;

$("#lawyerSignupTerms").change((e) => {
  let checked = $("#lawyerSignupTerms").is(':checked');
  if (checked) {
    $("#lawyerSignupTerms").removeClass('is-invalid');
    $("#lawyerCont").attr('title', 'Sign up');
    $("#lawyerSignupButton").removeClass('disabled');
  }
  else {
    $("#lawyerSignupButton").addClass("disabled");
    $("#lawyerCont").attr('title', 'Accept Terms, Conditions and Privacy Policy to continue');

  }

})
const signIn = async (email, password, callback) => {
  buttonLoad('lawyerLoginButton')
  try {
    let res = await firebase.auth().signInWithEmailAndPassword(email, password);
    let uid = res.user.uid;
    let idToken = await res.user.getIdToken();
    let req = { idToken, uid };
    let url = ABS_PATH + "lawyer/lawyerLogin";
    $.ajax({
      url: url,
      data: req,
      type: "POST",
      success: function (response) {
        console.log(response);
        if (response.status == "success") {
          $("#lawyerLogin").modal('hide');
          $.notify("Logging in", { type: "success", z_index: 5000 });
          if (callback) {
            callback();
          }
          else {
            clearLoad('lawyerLoginButton', 'Lawyer Login')
            $.notify("Logging in", { type: "success", z_index: 5000 });
            window.location.reload();
          }

        }
      },
      error: e => {
        console.log(e);
        clearLoad('lawyerLoginButton', 'Lawyer Login');
        $.notify('Network Error', { type: "success", z_index: 5000 })
      }
    });
  } catch (e) {
    console.log(e);
    let codes = {
      "auth/wrong-password": "Wrong password. Try again or click Forgot password to reset it.",
      "auth/user-not-found": `The user ${email} does not exist`,
    }
    let message = e.code == "auth/wrong-password" ? "Wrong password. Try again or click Forgot password to reset it." : e.message;
    message = codes[e.code];
    message = message ? message : "Network Error";
    clearLoad('lawyerLoginButton', "LOGIN");
    $.notify(message, { type: "danger", z_index: 5000 });
    $("#lawyerloginError").html(message);
    $("#lawyerloginError").removeClass('valid');
  }
};


$("#lawyerRegisterForm").submit(e => {
  e.preventDefault();
  var form = form2js("lawyerRegisterForm", ".");
  if (!$("#lawyerSignupTerms").is(':checked')) {
    $.notify('Please accept the terms and conditions', { type: "warning", z_index: 5000 });
    $("#lawyerSignupTerms").addClass('is-invalid');
    return false
  }
  uservar = form;
  buttonLoad('lawyerSignupButton')
  $.ajax({
    url: ABS_PATH + "lawyer/lawyerRegister",
    data: form,
    type: "POST",
    success: function (response) {
      if (!response) {
        $.notify("Network Error", { type: "danger", z_index: 5000 });
        return;
      }
      $("#lawyerRegisterForm").trigger("reset");

      console.log(response);
      if (!response.err) {

        clearLoad('lawyerSignupButton', "Signup As Lawyer");
        $.notify("A confirmation email has been sent to your inbox", { type: "success", z_index: 5000 });
        $("#lawyerMyTab").hide();
        $("#lawyerMyTabContent").hide();
        $("#lawyerSignupComplete").removeClass('signup-success');
      } else {
        clearLoad('lawyerSignupButton', "Signup As Lawyer")
        $("#lawyersignupError").html(response.message);
        $("#lawyersignupError").removeClass('valid');
        $.notify(response.message, { type: "warning", z_index: 5000 });
      }
    },
    error: e => {
      console.log(e);
      clearLoad('lawyerSignupButton', 'Sign Up');
      $.notify('Network Error', { type: "success", z_index: 5000 })
    }
  });
});


$("#lawyerResend").click((e) => {
  buttonLoad('lawyerResend');

  $.ajax({
    url: ABS_PATH + "lawyer/lawyerRegister",
    data: uservar,
    type: "POST",
    success: function (response) {


      console.log(response);
      if (!response.err) {

        clearLoad('lawyerResend', "Resend");
        $.notify("A confirmation email has been resent check your promotions, social or spam folder", { type: "success", z_index: 5000 });

      } else {
        clearLoad('lawyerResend', "Resend")

        $.notify(response.message, { type: "warning", z_index: 5000 });
      }
    },
    error: e => {
      console.log(e);
      clearLoad('lawyerResend', 'Resend');
      $.notify('Network Error', { type: "success", z_index: 5000 })
    }
  });
});



