const sendLawyerInviteEndPoint = "admin/sendLawyerInvite";
const fetchLawyersEndPoint = 'admin/fetchLawyers';

var filter = {
  param: '',
  paramValue: '',
  limit: 10,
  lastId: ''
}

const fetchLawyers = () => {
  $.ajax({
    url: ABS_PATH + fetchLawyersEndPoint,
    type: "POST",
    data: filter,
    success: function () {
      console.log('success', filter)
    },
    error: err => console.log("error", err)
  })
};
fetchLawyers();

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


$("#searchName").on('change keyup', function (e) {
  e.preventDefault();
  console.log($(this).val())
});

$("#status").change(function (e) {
  e.preventDefault();
  filter.param = 'status';
  filter.paramValue = $(this).val();
  $.notify("Search!", { type: "success" });

  // fetchLawyers();
});

$("#tag").change(function (e) {
  e.preventDefault();
  filter.param = 'tag';
  filter.paramValue = $(this).val();

  fetchLawyers();
});
