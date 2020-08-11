$("#laywerConfirm").submit(function (e) {
  e.preventDefault();

  var form = form2js("laywerConfirm", ".");
  if (form.password !== form.confirmPassword) {
    $.notify("Passwords must match", { type: "warning", z_index: 5000 });
    $("#confirmError").html("Passwords must match");
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

  // function dismiss(type) {
  //   console.log('clear called');
  //   if (type == 'recover') {
  //     $("#recoverForm").fadeIn();
  //     $("#forgotModal").modal('hide');
  //     $("#recoverComplete").addClass('recover-success');
  //   }

  //   if (type == 'signup') {

  //     $("#lawyerRegisterForm").fadeIn();
  //     $("#lawyerSignupComplete").addClass('signup-success');
  //     $("#lawyerLoginModal").modal('show');
  //   }
  // }

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
          $.notify("Logging in", { type: "success", z_index: 5000 });
          clearLoad('lawyerLoginButton')
          $.notify("Logging in", { type: "success", z_index: 5000 });
          window.location.reload();
          // setTimeout(function () { window.location = ABS_PATH + 'lawyer/dashboard' }, 2000);
        }
      },
      error: e => console.log(e)
    });
  } catch (e) {
    console.log(e);
    clearLoad('lawyerLoginButton', "LOGIN");
    $.notify(e.message, { type: "danger", z_index: 5000 });
    $("#lawyerloginError").html(e.message);
    $("#lawyerloginError").removeClass('valid');
    $.notify(e.message, { type: "warning", z_index: 5000 });
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
    error: e => console.log(e)
  });
});
