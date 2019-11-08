$("#laywerConfirm").submit(function (e) {
  e.preventDefault();

  var form = form2js("laywerConfirm", ".");
  if (form.password !== form.confirmPassword) {
    $.notify("Passwords must match", { type: "warning" });
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
      }
    },
    error: e => console.log(e)
  });
});

$("#lawyerLogin").submit(function (e) {
  e.preventDefault();
  let form = form2js("lawyerLogin", ".");

  let { email, password } = form;

  signIn(email, password);
});
var uservar;
const signIn = async (email, password) => {
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
          $.notify("Logging in", { type: "success" });
          setTimeout(function () { window.location = ABS_PATH + 'lawyer/home' }, 2000);
        }
      },
      error: e => console.log(e)
    });
  } catch (e) {
    console.log(e);
    $.notify(e.message, { type: "danger" });
  }
};