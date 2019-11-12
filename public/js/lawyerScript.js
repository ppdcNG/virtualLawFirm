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

  var form = form2js("lawyerLogin", ".");

  $.ajax({
    url: ABS_PATH + "lawyer/lawyerLogin",
    data: form,
    type: "POST",
    success: function (response) {
      console.log(response);
      if (!response.err) {
        $.notify("User created successfully", { type: "success" });

      } else {
        $.notify(response.message, { type: "warning" });
      }
    },
    error: e => console.log(e)
  });
});
