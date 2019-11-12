const sendLawyerInviteEndPoint = "admin/sendLawyerInvite";

const fetchLawyers = () => {
  return "";
};

const fetchCases = () => {
  return "";
};

///add Lawyer Form Submit
$("#lawyerInvite").submit(function (e) {
  e.preventDefault();

  var form = form2js("lawyerInvite", ".");
  this.reset()
  $.ajax({
    url: ABS_PATH + sendLawyerInviteEndPoint,
    type: "POST",
    data: form,
    success: function (response) {
      if (!response.err) {
        $("#close").trigger("click");
        $('#sendInvite').html('<span>Add</span>').removeClass('disabled');
        $.notify("Invitation sent!", { type: "success" });
      } else {
        $("#close").trigger("click");
        $('#sendInvite').html('<span>Add</span>').removeClass('disabled');
        $.notify(response.message, { type: "warning" });
      }
    },
    error: e => console.log("error", e)
  });
});
