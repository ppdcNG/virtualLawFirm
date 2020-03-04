
let lawyersList = {};
var ISSUE = '1';
let TASKS = {};
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

$("#idcard").change(function () {
    readURL(this, 'chosenIdDoc');
});

// upload profile pic
$("#uploadPic").submit(async function (e) {
    e.preventDefault();
    let uid = $("#uid").val();
    let file = $("#profilePic")[0].files[0];
    buttonLoad('uploadPicBtn')
    let validImages = ['image/png', 'image/jpg', 'image/jpeg'];
    if (validImages.indexOf(file.type) < 0) {
        $.notify('Invalid File type provided. Valid Files' + validImages.join(' '), { type: "warning" });
        clearLoad('uploadPicBtn', 'Upload');
        return false;
    }

    let task = await firebase.storage().ref('userfiles/' + uid).put(file);
    let url = await task.ref.getDownloadURL();
    let req = { url };


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
            location.reload();
        },
        error: err => {
            console.error('error', err);
            clearLoad('uploadPicBtn', 'Upload');
        }
    })

});

//update profile
$("#updateProfile").submit(function (e) {
    e.preventDefault();
    let form = form2js("updateProfile", ".");
    console.log(uid);
    buttonLoad('updateProfileBtn')
    $.ajax({
        url: ABS_PATH + "client/updateProfile",
        data: form,
        type: "POST",
        success: function (response) {
            $("#closeProfileModal").trigger("click");
            console.log(response);
            if (!response.err) {
                $.notify("Saved!", { type: "success" });
            } else {
                $.notify(response.message, { type: "warning" });
            }

            clearLoad('updateProfileBtn', 'Upload');
            location.reload();
        },
        error: err => {
            console.error('error', err);
            clearLoad('updateProfileBtn', 'Upload');
        }
    })

})

// upload id card
$("#uploadID").submit(async function (e) {
    e.preventDefault();

    let form = form2js("uploadID", ".");
    let uid = $("#uid").val();
    console.log(uid);

    let file = $("#idcard")[0].files[0];
    let validImages = ['image/png', 'image/jpg', 'image/jpeg'];
    if (validImages.indexOf(file.type) < 0) {
        $.notify('Invalid File type provided. Valid Files' + validImages.join(' '), { type: "warning" });
        clearLoad('uploadIdBtn', 'Upload');
        return false;
    }

    let task = await firebase.storage().ref('idcards/' + uid).put(file);
    let url = await task.ref.getDownloadURL();

    form.url = url;

    console.table(form)

    $.ajax({
        url: ABS_PATH + "client/updateProfile",
        data: form,
        type: "POST",
        success: function (response) {
            console.log(response);
            if (!response.err) {
                $.notify("Saved!", { type: "success" });
            } else {
                $.notify(response.message, { type: "warning" });
            }
            clearLoad('uploadIdBtn', 'Upload');
            location.reload();
        },
        error: err => {
            console.error('error', err);
            clearLoad('uploadIdBtn', 'Upload');
        }
    })

});


$("#settingsForm").submit(function (e) {
    e.preventDefault();
    let settings = form2js('settingsForm', '.', false);
    console.log(settings);
    buttonLoad('submitprofile');
    $.ajax({
        url: ABS_PATH + "client/updateSettings",
        data: settings,
        type: "POST",
        success: function (response) {
            console.log(response);
            clearLoad('submitprofile', 'Save Changes');
            if (!response.err) {
                $.notify(response.message, { type: "success" });

            } else {
                $.notify(response.message, { type: "warning" });
            }
        },
        error: e => {
            console.log('error', e);
            clearLoad('submitprofile', 'Save Changes');
        }
    });

});

$("#subject").on("change keyup", function () {
    clearLoad("next", "Next");
})

$("#prev").click(async function (e) {
    $("#fetchLawyersSection").css('display', 'none');
    $("#findLawyersSection").css('display', 'block');
});

$("#clientInvite").submit(function (e) {
    e.preventDefault();

    let data = form2js('clientInvite', '.', true);

    loadBtn('submitInvite');

    $.ajax({
        url: ABS_PATH + "client/invite",
        data: data,
        type: "POST",
        success: function (response) {
            console.log(response);
            clearLoad('submitInvite', 'Send');
            if (!response.err) {
                $("#closeInviteBtn").trigger("click");
                $("#inviteEmail").val('');
                $.notify(response.message, { type: "success" });

            } else {
                $.notify(response.message, { type: "warning" });
            }
        },
        error: e => {
            console.log('error', e);
            clearLoad('submitInvite', 'Send');
        }
    });

});


$("#updateProfile input").trigger('change');


const fetchCases = async () => {
    let uid = $("#uid").val();
    console.log(uid);
    let cases = await firebase.firestore().collection('clients').doc(uid).collection('tasks').get().catch((e) => { console.log(e) });

    let tasksHTML = "";
    cases.forEach(value => {
        let task = value.data();
        TASKS[value.id] = task
        tasksHTML += renderTasks(task, value.id);
    });

    if (is_empty(tasksHTML)) {
        $("#casesTable").html('<p class="p-2">You have no tasks yet</p>');
    } else {
        $("#tasksTable").html(tasksHTML);
    }

    $("#loadingTasks").css('display', 'none');

}

// render tasks
const renderTasks = (task, id) => {
    let { timestamp } = task;

    let formattedTimestamp = Math.abs(timestamp);
    let time = moment(formattedTimestamp).format("dddd, MMMM Do YYYY");


    return `<tr>
        <td>${task.subject}</td>
        <td>${time}</td>
        <td>
            <img src="${task.lawyer.photoUrl}" class="rounded-circle z-depth-0 mr-2"
            alt="lawyerPic" height="50">
            <span class="mr-2">${task.lawyer.name}</span>
            <button class="btn btn-info mr-4" data-toggle="modal" onclick = "openLawyerDetailsModal('${id}')" data-target="#lawyerDetailsModal">More</button>
        </td>
    </tr>
    `
}

const openLawyerDetailsModal = (id) => {
    let task = TASKS[id];
    renderTaskModal(task, taskId);

    $("#lawyerDetailsModal").modal('show')


}

const renderTaskModal = (task, taskId) => {

    $("#taskId").val(taskId);
    $("#lawyerName").text(task.lawyer.name);
    $("#lawyerDetailsList").html(`
    <img src="${task.lawyer.photoUrl}" class="rounded-circle z-depth-0 mr-2"
                alt="lawyerPic" height="100">
                <hr width="50" />
                <ul class="list-group">
                    <li class="list-group-item"><i class="fas fa-user float-left"></i>${task.lawyer.name}</li>
                    <li class="list-group-item"><i class="fas fa-mobile float-left"></i></i>${task.lawyer.phoneNumber || "N/A"}</li>
                    <li class="list-group-item"><i class="fas fa-at float-left"></i>${task.lawyer.email || "N/A"}</li>
                    <li class="list-group-item"><i class="fas fa-road float-left"></i>${task.lawyer.address}</li>
                    <li class="list-group-item"><i class="fas fa-map-marker-alt float-left"></i>${task.lawyer.lga}</li>
                    <li class="list-group-item"><i class="fas fa-globe-africa float-left"></i>${task.lawyer.country}</li>
                </ul>
    `);

}

fetchCases();