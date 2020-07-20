let lawyersList = {};
var ISSUE = '1';
let TASKS = {};
var CHATS = [];
var CHAT_MESSAGES = [];
var Chatlistener = null;
var CHAT_ID = null;
var TASK_CATEGORIES = {};

var uid = $("#uid").val();
var taskId = $("#taskId").val();


$(document).ready(function () {
    fetchCases();
});




const fetchCases = async () => {
    let uid = $("#uid").val();
    console.log(uid);
    let cases = await firebase.firestore().collection('clients').doc(uid).collection('tasks').orderBy('timestamp').onSnapshot(handleCaseFetch);
}
const handleCaseFetch = cases => {
    let tasksHTML = "";
    cases.forEach(value => {
        let task = value.data();
        TASKS[value.id] = task;
        TASK_CATEGORIES[task.status] ? TASK_CATEGORIES[task.status] += 1 : TASK_CATEGORIES[task.status] = 1;
        tasksHTML += renderTasks(task, value.id);
    });

    if (is_empty(tasksHTML)) {
        $("#consultations").html(`<div class = "card teal lighten-5">
        <div class = "card-body"><p class="m-1 p-2">You have no consultation yet</p>
        <a href = "/client/findLawyer" class = "btn btn-accent">Find a Lawyer Now</a>
        </div>
        </div>`);
    } else {
        $("#consultations").html(tasksHTML);
    }
    console.log(TASK_CATEGORIES);
    let active = TASK_CATEGORIES['consulting'] ? TASK_CATEGORIES['consulting'] : 0
    let closed = TASK_CATEGORIES['closed'] ? TASK_CATEGORIES['closed'] : 0;
    $("#activeConsulting").text(active);
    $("#closedConsulting").text(closed);
    $("#loadingTasks").css('display', 'none');
}

const countUnread = (notifications) => {
    let count = 0;
    notifications.forEach((note, i) => {
        note.read || count++;
    });
    return count;
}

const renderTasks = (task, id) => {
    let { timestamp } = task;
    let count = task.activities ? countUnread(task.activities) : 0;
    let badge = count > 0 ? `<span class="badge badge-danger ml-2">${count}</span>` : "";
    let formattedTimestamp = Math.abs(timestamp);
    let time = moment(formattedTimestamp).format("dddd, MMMM Do YYYY");

    let paymentButton = task.pendingPayment ? renderInvoicePaymentButton(id) : ''


    return `<div class="col-md-4 mb-4">
    <div class="card h-100" style="background-color: #C8F2EF;">
        <div class="lawyer-card card-body" onclick = "gotoLawyer('${id}')">
            <div class = "d-flex flex-row justify-content-between align-items-center">
            <small class="text-default"><i class="fas fa-circle"></i> ${task.status}</small>
            <small class="text-default"><i class="fas fa-bell"></i> ${badge}</small>
            </div>
            
            <div class = "mt-3 row">
                <div class="col-md-8 d-flex flex-column justify-content-center">
                    <h4 class="card-title font-weight-bold mr-auto mb-1">${truncate(task.title, 17)}<br/>
                    </h4>
                    <small>${truncate(task.lawyer.name, 15)}</small>
                </div>
                <div class = "col-md-4 d-flex justify-content-center align-items-center">
                    <img src="${task.lawyer.photoUrl}" class="rounded-circle z-depth-0" style = "border: 1px solid var(--accent-colr)" alt="avatar image" height="70" width="70">
                </div>
            </div>
            <div class = "d-flex flex-row justify-content-between mt-4">
            <div clasS = "d-flex flex-column justify-content-center">
                <span class = "lawyer-feature-header">Consultation Date</span>
                <span class = "lawyer-feature-value">${time}</span>
            </div>
            <div>
                <a href = "/client/consultation?id=${id}" class="btn btn-warning">Manage</a>
            </div>
            </div>
        </div>
    </div>
</div>
    `
}


function readURL(input, id) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            // $('#chosenPic').attr('src', e.target.result);
            $('#' + id).attr('src', e.target.result);
        }

        reader.readAsDataURL(input.files[0]);
    }
}

$("#profilePic").change(function () {
    readURL(this, 'chosenPic');
});

$("#uploadPic").submit(async function (e) {
    e.preventDefault();
    let uid = $("#uid").val();
    let file = $("#profilePic")[0].files[0];
    buttonLoadSpinner('uploadPicBtn');
    let validImages = ['image/png', 'image/jpg', 'image/jpeg'];
    if (validImages.indexOf(file.type) < 0) {
        $.notify('Invalid File type provided. Valid Files' + validImages.join(' '), { type: "warning" });
        clearLoad('uploadPicBtn', 'Upload');
        return false;
    }
    console.log('uploading');
    let task = await firebase.storage().ref('userfiles/' + uid).put(file);
    let url = await task.ref.getDownloadURL();
    let req = { url };

    console.log('done uploading');


    $.ajax({
        url: ABS_PATH + "client/updateProfilePic",
        data: req,
        type: "POST",
        success: function (response) {
            $("#closeProfileModal").trigger("click");
            console.log(response);
            if (!response.err) {
                $.notify("Saved!", { type: "success" });
            } else {
                $.notify(response.message, { type: "warning" });
            }

            clearLoad('uploadPicBtn', 'Upload');
            $("#chosenPic").attr('src', url);
            $("#navPhoto").attr('src', url);
        },
        error: err => {
            console.error('error', err);
            clearLoad('uploadPicBtn', 'Upload');
        }
    })

});

$("#changePasswordForm").submit(function (e) {
    e.preventDefault();
    let form = form2js('changePasswordForm', ".", false);
    if (form.password !== form.confirm) {
        $.notify("Passwords do not match !", { type: 'danger', delay: 2500 });
        return;
    }
    buttonLoadSpinner('changePasswordButton')
    let url = ABS_PATH + "client/changePassword";
    $.ajax({
        type: "POST",
        url,
        data: form,
        success: function (response) {
            console.log(response);
            $.notify("Password Change Succesful", { type: "succes", delay: 2500 });
            clearLoad('changePasswordButton', "Change")
            this.reset();
        },
        error: err => {
            console.log('error', err);
            $.notify(err.responseJSON.message, { type: "danger", delay: 2000 });
            clearLoad('changePasswordButton', 'Upload');
        }
    });
});


$("#updateProfile").submit(function (e) {
    e.preventDefault();
    let form = form2js("updateProfile", ".");
    console.log(uid);
    buttonLoadSpinner('updateProfileBtn')
    $.ajax({
        url: ABS_PATH + "client/updateProfile",
        data: form,
        type: "POST",
        success: function (response) {

            if (!response.err) {
                $.notify("Profile Updated!", { type: "success" });
            } else {
                $.notify(response.message, { type: "warning" });
            }

            clearLoad('updateProfileBtn', 'Save');
        },
        error: err => {
            console.error('error', err);
            clearLoad('updateProfileBtn', 'Save');
        }
    })

});
