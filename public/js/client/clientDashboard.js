
let lawyersList = {};
var ISSUE = '1';
let TASKS = {};
var CHATS = [];
var CHAT_MESSAGES = [];
var Chatlistener = null;
var CHAT_ID = null;

$(document).ready(function () {
    fetchCases();
    fetchChats();
});

$("#chatTextForm").submit(async function (e) {
    e.preventDefault();
    let prevButtonContent = $("#sendChatButton").html();
    buttonLoad("sendChatButton");
    let chatmessage = $("#chatInput").val();
    let response = await sendChat(CHAT_ID, chatmessage);
    clearLoad('sendChatButton', prevButtonContent);
    console.log(response);
    console.log(this);
    this.reset()
})
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

});


const sendChat = async (chatId, message) => {
    let uid = $("#uid").val();
    let senderName = $("#displayName").val();

    console.log(uid);
    let chat = {
        senderId: uid,
        chatId,
        message,
        timestamp: 0 - new Date().getTime(),
        senderName
    }
    let docref = firebase.firestore().collection('chats').doc(chatId);
    return await docref.update({
        messages: firebase.firestore.FieldValue.arrayUnion(chat)
    });

}

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
    let cases = await firebase.firestore().collection('clients').doc(uid).collection('tasks').onSnapshot(handleCaseFetch);



}
const handleCaseFetch = cases => {
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

const openNotificationModal = i => {
    let task = TASKS[i];
    let notifications = task.activities || []
    let typeDict = { payment: renderPaymentNotification, meeting: renderMeetingNotification };
    let noteHTML = '';
    notifications.forEach((note, noteId) => {
        noteHTML = typeDict[note.type](note, i, noteId);
    });
    $('#notificationList').html(noteHTML);
    $("#notificationModal").modal('show');
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
    TASKS[taskId].activities[noteId] = true;
    let notification = TASKS[taskId].activities

    await firebase.firestore().collection('clients').doc(uid).collection('tasks').doc(taskId).update({ activities: notification }).catch((e) => {
        console.log(e);
    });
    $(this).removeClass('default-color');

}


const renderPaymentNotification = (note, taskId, noteId) => {
    let time = moment(Math.abs(note.timestamp));
    let read = note.read ? "" : 'default-color';

    return `<li class="list-group-item ${read}" onclick = "markAsRead('${taskId}', '${noteId}')">
                <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-2 h5">${note.title}</h5>
                <small>${time.fromNow()}</small>
                </div>
                <p class="mb-2">
                ${note.message}</p>
                <small>Mark as read</small>
            </li>`
}
const renderMeetingNotification = (note, taskId, noteId) => {
    let time = moment(Math.abs(note.timestamp))
    let read = note.read ? "" : 'default-color'

    return `<li class="list-group-item ${read}" onclick = "markAsRead('${taskId}', '${noteId}')">
        <div class="d-flex w-100 justify-content-between">
        <h5 class="mb-2 h5">${note.title}</h5>
        <small>${time.fromNow()}</small>
        </div>
        <p class="mb-2">
        ${note.message}.</p>
        <div class = "d-flex w-40">
        <button class = "btn btn-outline-default" onclick = "gotoMeetings('${note.meetingId}')"><i class="fas fa-video pr-2"></i> Join Meeting</button>
        </div>
    </li>`
}

// render tasks
const renderTasks = (task, id) => {
    let { timestamp } = task;
    let count = task.activities ? countUnread(task.activities) : 0;
    let badge = count > 0 ? `<span class="badge badge-danger ml-2">${count}</span>` : "";
    let formattedTimestamp = Math.abs(timestamp);
    let time = moment(formattedTimestamp).format("dddd, MMMM Do YYYY");


    return `<tr>
        <td>${task.subject}</td>
        <td>${time}</td>
        <td>
            <img src="${task.lawyer.photoUrl}" class="rounded-circle z-depth-0 mr-2"
            alt="lawyerPic" height="50">
            <span class="mr-2">${task.lawyer.name}</span>
            <button class="btn btn-info mr-4" title = "Details of your Legal Counsel"   onclick = "openLawyerDetailsModal('${id}')" data-toglle = "tooltip" data-target="#lawyerDetailsModal">Lawyer</button>
            <button class="btn special-color text-white mr-4" data-toggle="tooltip" title = "Notifications about your Case" onclick = "openNotificationModal('${id}')" data-target="#notificationModal"><i class="far fa-bell pr-2"></i> Notifications ${badge}</button>
        </td>
    </tr>
    `
}

const openLawyerDetailsModal = (id) => {
    let task = TASKS[id];
    renderTaskModal(task, id);

    $("#lawyerDetailsModal").modal('show')


}





const chatWithLawyer = () => {
    let taskId = $("#taskId").val();
    console.log(taskId);
    let task = TASKS[taskId];
    let obj = {
        clientName: task.client.displayName,
        clientId: task.client.uid,
        clientPhoto: task.client.photoURL,
        lawyerId: task.lawyer.uid,
        lawyerName: task.lawyer.name,
        lawyerPhoto: task.lawyer.photoUrl
    }

    let url = ABS_PATH + 'client/initiateChat';
    buttonLoad('chatWithLawyerButton');

    $.ajax({
        url,
        data: obj,
        type: "POST",
        success: async function (response) {
            console.log(response);
            clearLoad('chatWithLawyerButton', 'Chat');
            if (response.status == "success") {
                $("#lawyerDetailsModal").modal('hide');
                $('#mainTab li:nth-child(2) a').tab('show');
                await fetchChats();
            }
        },
        error: e => {
            console.log('error', e);
            clearLoad('chatWithLawyerButton', 'Chat');
        }
    });


}

const fetchChats = async () => {
    let myId = $("#uid").val();
    let chatsSnapshot = await firebase.firestore().collection('clients').doc(myId).collection('chats').get();
    let chatsHtml = "";
    chatsSnapshot.forEach((chat) => {
        CHATS[chat.id] = chat.data();
        chatsHtml += renderChatList(CHATS[chat.id]);
    })

    $("#chatList").html(chatsHtml);
    console.log(CHATS);


}

const listenForChatMessages = async (chatId) => {
    if (Chatlistener != null) {
        Chatlistener();
    }
    Chatlistener = firebase.firestore().collection('chats').doc(chatId).onSnapshot((snapshot) => {
        let chatData = snapshot.data();
        console.log(chatData);
        if (!chatData.messages) {
            renderChats([]);
            return;
        }

        if (is_empty(CHAT_MESSAGES)) {
            console.log('empty Chats')
            CHAT_MESSAGES = chatData.messages;
            renderChats(CHAT_MESSAGES);
            return;
        }
        let incomingChats = chatData.messages;
        let diff = incomingChats.length - CHAT_MESSAGES.length;
        let newchats = diff ? incomingChats.slice(CHAT_MESSAGES.length) : [];
        console.log(newchats);
        renderChats(newchats, true);
    });

}
const viewChat = chatId => {
    CHAT_ID = chatId
    CHAT_MESSAGES = [];
    $("#chatsContainer").html(`<div class="spinner-grow slow align-self-center" role="status" id="loadingTasks"><span class="sr-only">Loading...</span></div>`);
    listenForChatMessages(chatId);

    $("#chatInputField").css("visibility", "visible");
}

const renderTaskModal = (task, taskId) => {
    $("#taskId").val(taskId);
    $("#lawyerName").text(task.lawyer.name);
    $("#lawyerDetailsList").html(`
    <img src="${task.lawyer.photoUrl}" class="rounded-circle z-depth-0 mr-2"
                alt="lawyerPic" height="70">
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

const renderChatList = (chat) => {
    return `
    <li class="list-group-item mb-1">
        <a href = "#" onclick = "viewChat('${chat.chatId}')">
        <img src="${chat.lawyerPhoto}" class="rounded-circle z-depth-0 "
            alt="lawyer Pic" height="50"><br/>  ${chat.lawyerName} </a>
    </li>
    `;
}

const renderChats = (chats, append = false) => {

    if (is_empty(chats)) {
        $("#chatsContainer").html("<h4>No chats Available Be the first to send a message</h4>");
    }
    let uid = $("#uid").val();
    let chathtml = "";
    chats.map((chat) => {
        chathtml += chat.senderId == uid ? renderSenderChat(chat) : renderReceiverChat(chat);
    })

    append ? $("#chatsContainer").append(chathtml) : $("#chatsContainer").html(chathtml);

    $("#chatsContainer").animate({ scrollTop: $('#chatsContainer').prop("scrollHeight") }, 1000);

}

const renderSenderChat = (chat) => {

    let momentDate = new moment(Math.abs(chat.timestamp));
    let timeago = momentDate.fromNow();

    return `<div class="container align-self-end " style = "width: 30%">
                <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-2 h5 teal-text">${chat.senderName}</h5>
                <small class = "text-muted">${timeago}</small>
                </div>
                <p class="mb-2 blue-grey-text">${chat.message}</p>
            </div>`;
}

const renderReceiverChat = (chat) => {
    let momentDate = new moment(Math.abs(chat.timestamp));
    let timeago = momentDate.fromNow();

    return `<div class="container" style = "width: 30%">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-2 h5 teal-text">${chat.senderName}</h5>
                    <small class = "text-muted">${timeago}</small>
                </div>
                <p class="mb-2 blue-grey-text">${chat.message}</p>
            </div>`;
}


// submit complaint
$("#complaintForm").submit((e) => {
    e.preventDefault();
    let form = form2js("complaintForm", ".");

    console.log(form);

});

// invoice form 
$("#invoiceForm").submit((e) => {
    e.preventDefault();
})