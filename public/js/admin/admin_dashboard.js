

const sendLawyerInviteEndPoint = "admin/sendLawyerInvite";
const fetchLawyersEndPoint = 'admin/fetchLawyers';
var TASKS = {};
var page = 1;
var lastRef = null;
var firstRef = null;
var dataRefs = [];
var limit = 2;
let taskRef = null;
var lawyerList = [];

var filter = {
  param: '',
  paramValue: '',
  limit: 10,
  lastId: ''
}

var lawyers = "";

$(document).ready(() => {
  fetchLawyers();
  fetchCases();
  fetchquestions();
})

$("#filterCases").submit(async function (e) {
  e.preventDefault();
  await fetchCases();
  this.reset();
})

const fetchLawyers = () => {
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


const viewSummary = (id) => {
  let name = id;
  for (var i in lawyers) {
    if (id === lawyers[i].authId) {

      // set location
      let location = "";
      let photoUrl = "";

      if (lawyers[i].contact) {
        location = `${lawyers[i].contact.lga}, ${lawyers[i].contact.country}`;
        photoUrl = lawyers[i].contact.photoUrl;
      } else {
        location = "N/A";
        photoUrl = 'https://i1.wp.com/www.essexyachtclub.co.uk/wp-content/uploads/2019/03/person-placeholder-portrait.png?fit=500%2C500&ssl=1';
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
      $("#profilePic").attr("src", photoUrl);
      $("#name").text(lawyers[i].name);
      $("#loc").text(location);
      $("#exp").text(expYears);
      $("#fee").text(consultationFee);

      $("#link").html(`<a href="/admin/details?id=${id}">Go to full details <i class="fas fa-caret-right"></i></a>`)

    }
  }
}

const fetchCases = async () => {
  let databaseRef = addFilters();
  let cases = await databaseRef.orderBy('timestamp').limit(limit).get().catch((e) => { console.log(e) });
  console.log(cases);
  let count = 1;
  let casesHtml = '';
  cases.forEach((task) => {

    count == 1 && (firstRef = task);
    count == limit && (lastRef = task)
    count += 1;
    TASKS[task.id] = task.data();
    casesHtml += renderCases(TASKS[task.id], task.id);
  });
  $("#loadingTasks").css('display', 'none');
  $("#adminCases").html(casesHtml);

};

const addTimelineFilter = (dbRef, start, end) => {
  return dbRef.where('timestamp', '>=', start).where('timestamp', '<=', end);
}

const addStatusFilter = (dbRef, status) => {
  return dbRef.where('status', '==', status);
}
const addLawyerFilter = (dbRef, lawyerId) => {
  return dbRef.where('lawyerId', '==', lawyerId);
}

const addFilters = () => {
  let databaseRef = firebase.firestore().collection('cases');
  let form = form2js("filterCases", '.');
  console.log(form);
  if (form.status) databaseRef = addStatusFilter(databaseRef, form.status);
  if (form.lawyer) databaseRef = addLawyerFilter(databaseRef, form.lawyer);
  if (form.start && form.end) {
    let startdate = 0 - new Date(form.start).getTime();
    let enddate = 0 - new Date(form.end).getTime();
    databaseRef = addTimelineFilter(databaseRef, startdate, enddate);
  }
  return databaseRef
}

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

function clearLoad(id, text) {
  $('#' + id).html('<span>' + text + '</span >');
}

const verifyLawyer = id => {
  buttonLoad('verify');
  $.ajax({
    url: `${ABS_PATH}admin/verifyLawyer?id=${id}`,
    type: "POST",
    success: function (response) {
      clearLoad("verify", "verified");
      $.notify("Lawyer verified!", { type: "success" });
    },
    error: err => console.log("error", err)
  });
}

const suspendLawyer = id => {
  buttonLoad('suspendButton');
  $.ajax({
    url: `${ABS_PATH}admin/suspendLawyer?id=${id}`,
    type: "POST",
    success: function (response) {
      if (response.err) {
        $.notify(response.message, { type: danger });
        return;
      }
      clearLoad("suspendButton", "Suspend");
      $.notify("Lawyer suspended!", { type: "success" });
    },
    error: err => console.log("error", err)
  });
}

const viewCase = id => {
  let task = TASKS[id];
  console.log(task);
  let formattedTimestamp = Math.abs(task.timestamp);
  let time = moment(formattedTimestamp).format("dddd, MMMM Do YYYY");
  let ele = {};
  $("#task_subject").html(task.subject);
  $("#task_issue").html(task.issue);
  $("#task_tags").html(task.tags.join(','));
  $("#task_status").html(task.status || "N/A");
  $("#task_date").html(time);

  $("#task_clientName").html(task.client.displayName || "N/A");
  $("#task_clientPhone").html(task.client.phoneNumber || "N/A");
  $("#task_clientEmail").html(task.client.email || "N/A");

  $("#task_lawyerEmail").html(task.lawyer.email);
  $("#task_lawyerPhone").html(task.lawyer.phoneNumber || "N/A");
  $("#task_lawyerAddress").text(task.lawyer.address || "N/A");
  $("#task_lawyerName").text(task.lawyer.name || "N/A");
  $("#taskDetailsModal").modal('show');
}

const next = async () => {
  if (!lastRef) return
  $("#adminCases").html("");
  $("#loadingTasks").css('display', 'block');
  page += 1;
  let casesHtml = "";
  let count = 1;
  dataRefs.push(firstRef);
  let db = addFilters()
  let cases = await db.orderBy('timestamp').startAfter(lastRef).limit(limit).get().catch((e) => { console.log(e) });
  cases.forEach((task) => {
    count == 1 && (firstRef = task);
    count == limit && (lastRef = task)
    TASKS[task.id] = task.data();
    casesHtml += renderCases(TASKS[task.id], task.id);
    count += 1;
  });
  $("#loadingTasks").css('display', 'none');
  $("#adminCases").html(casesHtml);
}

const prev = async () => {
  if (dataRefs.length < 1 || page <= 1) return;
  $("#adminCases").html("");
  $("#loadingTasks").css('display', 'block');
  page -= 1;
  let count = 1;
  let casesHtml = "";
  let prevRef = dataRefs.pop();
  let db = addFilters();
  let cases = await db.orderBy('timestamp').startAt(prevRef).limit(limit).get().catch((e) => { });
  cases.forEach((task) => {
    count == limit && (lastRef = task)
    count += 1;
    TASKS[task.id] = task.data();
    casesHtml += renderCases(TASKS[task.id], task.id);
  })
  $("#loadingTasks").css('display', 'none');
  $("#adminCases").html(casesHtml);


}

const contactModal = () => {
  $("#contactModal").modal('show');
}


const renderTableLoading = () => {
  return ``
}

const historyModal = i => {
  console.log('openning notification', i)
  renderNotification(i);
  $("#historyModal").modal('show');
}

const countUnread = (notifications) => {
  let count = 0;
  notifications.forEach((note, i) => {
    note.read || count++;
  });
  return count;
}
async function markAsRead(taskId, noteId) {
  let uid = $("#uid").val();
  console.log(taskId);
  TASKS[taskId].activities[noteId].read = true;
  let notification = TASKS[taskId].activities;

  await firebase.firestore().collection('cases').doc(uid).collection('tasks').doc(taskId).update({ activities: notification }).catch((e) => {
    console.log(e);
  });
  renderNotification(taskId);

}




