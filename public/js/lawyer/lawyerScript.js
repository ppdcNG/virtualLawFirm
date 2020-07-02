$("#laywerConfirm").submit(function (e) {
  e.preventDefault();

  var form = form2js("laywerConfirm", ".");
  if (form.password !== form.confirmPassword) {
    $.notify("Passwords must match", { type: "warning" });
    clearLoad('continue', 'Continue');

    return false;
  }
  $(this)[0].reset();
  $.ajax({
    url: ABS_PATH + "admin/verifyLawyerEmail",
    data: form,
    type: "POST",
    success: function (response) {
      console.log(response);
      if (!response.err) {
        $.notify("User created successfully", { type: "success" });
        setTimeout(function () { window.location = ABS_PATH + 'lawyer/login' }, 2000);
      } else {
        $.notify(response.message, { type: "warning" });
        clearLoad('continue', 'Continue');
      }
    },
    error: e => {
      console.log(e);
      clearLoad('continue', 'Continue');
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
    $("#lawyerSignupButton").removeClass('disabled');
  }
  else {
    $("#lawyerSignupButton").addClass("disabled");
  }

})
const signIn = async (email, password) => {
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
          $.notify("Logging in", { type: "success" });
          clearLoad('lawyerLoginButton')
          $.notify("Logging in", { type: "success" });
          window.location.reload();
          // setTimeout(function () { window.location = ABS_PATH + 'lawyer/dashboard' }, 2000);
        }
      },
      error: e => console.log(e)
    });
  } catch (e) {
    console.log(e);
    clearLoad('lawyerLoginButton', "LOGIN");
    $.notify(e.message, { type: "danger" });
    $("#lawyerloginError").html(e.message);
    $("#lawyerloginError").removeClass('valid');
    $.notify(e.message, { type: "warning" });
  }
};


$("#lawyerRegisterForm").submit(e => {
  e.preventDefault();
  var form = form2js("lawyerRegisterForm", ".");
  if (!$("#lawyerSignupTerms").is(':checked')) {
    $.notify('Please accept the terms and conditions');
    $("#lawyerSignupTerms").addClass('is-invalid');
    return false
  }
  buttonLoad('lawyerSignupButton')
  $.ajax({
    url: ABS_PATH + "lawyer/lawyerRegister",
    data: form,
    type: "POST",
    success: function (response) {
      $("#lawyerRegisterForm").trigger("reset");

      console.log(response);
      if (!response.err) {

        clearLoad('lawyerSignupButton', "Signup As Lawyer");
        $.notify("A confirmation email has been sent to your inbox", { type: "success" });
        $("#lawyerMyTab").hide();
        $("#lawyerMyTabContent").hide();
        $("#lawyerSignupComplete").removeClass('signup-success');
      } else {
        clearLoad('lawyerSignupButton', "Signup As Lawyer")
        $("#lawyersignupError").html(response.message);
        $("#lawyersignupError").removeClass('valid');
        $.notify(response.message, { type: "warning" });
      }
    },
    error: e => console.log(e)
  });
});
