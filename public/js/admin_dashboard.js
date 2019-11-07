const sendLawyerInviteEndPoint = "admin/sendLawyerInvite";

const fetchLawyers = () => {
  return "";
};

const fetchCases = () => {
  return "";
};

///add Lawyer Form Submit
$("#lawyerInvite").submit(e => {
  e.preventDefault();
  var form = form2js("lawyerInvite", ".");

  $.ajax({
    url: ABS_PATH + sendLawyerInviteEndPoint,
    type: "POST",
    data: form,
    success: function(response) {
      if (!response.err) {
        $.notify("Invitation sent!", { type: "success" });
      } else {
        $.notify(response.err.message, { type: "warning" });
      }
    },
    error: e => console.log("error", e)
  });
});
