const sendLawyerInviteEndPoint = "admin/sendLawyerInvite";
const fetchLawyersEndPoint = 'admin/fetchLawyers';

var filter = {
  param: '',
  paramValue: '',
  limit: 10,
  lastId: ''
}

var lawyers = "";

const fetchLawyers = () => {
  $.notify("Loading lawyers", { type: "success" });

  $.ajax({
    url: ABS_PATH + fetchLawyersEndPoint,
    type: "POST",
    data: filter,
    success: function (response) {
      lawyers = response;
      console.log(lawyers);

      for (var i in lawyers) {
        $("#lawyersTable").append(renderTable(i, lawyers[i]));
      }

    },
    error: err => console.log("error", err)
  })
}
fetchLawyers();

const viewSummary = (id) => {
  let name = id;
  for (var i in lawyers) {
    if (id === lawyers[i].authId) {

      // set location
      let location = "";
      if (lawyers[i].contact) {
        location = `${lawyers[i].contact.lga}, ${lawyers[i].contact.country}`
      } else {
        location = "N/A"
      }
      // set experience yrs
      let expYears = "";
      let consultationFee = "";
      if (lawyers[i].portfolio) {
        expYears = lawyers[i].portfolio.workExperience
        consultationFee = lawyers[i].portfolio.consultationFee
      } else {
        expYears = "N/A";
        consultationFee = "N/A";
      }

      // update the ui
      $("#name").text(lawyers[i].name);
      $("#loc").text(location);
      $("#exp").text(expYears);
      $("#fee").text(consultationFee);

      $("#link").html(`<a href="/lawyer/details?id=${id}">Go to full details <i class="fas fa-caret-right"></i></a>`)

    }
  }
}

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
  $.notify("Searching..", { type: "success" });

  fetchLawyers();
});

$("#tag").change(function (e) {
  e.preventDefault();
  filter.param = 'tag';
  filter.paramValue = $(this).val();

  $.notify("Searching..", { type: "success" });

  fetchLawyers();
});
