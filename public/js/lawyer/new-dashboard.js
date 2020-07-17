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
    let cases = await firebase.firestore().collection('lawyers').doc(uid).collection('tasks').orderBy('timestamp').onSnapshot(handleCaseFetch);
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
    console.log(task)
    let { timestamp } = task;
    let count = task.activities ? countUnread(task.activities) : 0;
    let badge = count > 0 ? `<span class="badge badge-danger ml-2">${count}</span>` : "";
    let title = task.title ? truncate(task.title, 45) : truncate(task.subject, 45);
    let formattedTimestamp = Math.abs(timestamp);
    let time = moment(formattedTimestamp).format("dddd, MMMM Do YYYY");

    let photoURL = task.client.photoURL ? task.client.photoURL : 'https://i1.wp.com/www.essexyachtclub.co.uk/wp-content/uploads/2019/03/person-placeholder-portrait.png?fit=500%2C500&ssl=1'

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
                    <h4 class="card-title font-weight-bold mr-auto mb-1">${title}<br/>
                    </h4>
                    <small>${truncate(task.client.displayName, 15)}</small>
                </div>
                <div class = "col-md-4 d-flex justify-content-center align-items-center">
                    <img src="${photoURL}" class="rounded-circle z-depth-0" style = "border: 1px solid var(--accent-colr)" alt="avatar image" height="70" width="70">
                </div>
            </div>
            <div class = "d-flex flex-row justify-content-between mt-4">
            <div clasS = "d-flex flex-column justify-content-center">
                <span class = "lawyer-feature-header">Consultation Date</span>
                <span class = "lawyer-feature-value">${time}</span>
            </div>
            <div>
                <a href = "/lawyer/consultation?id=${id}" class="btn btn-warning">Manage</a>
            </div>
            </div>
        </div>
    </div>
</div>
    `
}



$(function () {
    console.log('ready!')
    fetchChats();
});
const fetchChats = async () => {
    let myId = $("#uid").val();
    let chatsSnapshot = await firebase.firestore().collection('lawyers').doc(myId).collection('chats').get();
    let chatsHtml = "";
    chatsSnapshot.forEach((chat) => {
        CHATS[chat.id] = chat.data();
        chatsHtml += renderChatList(CHATS[chat.id]);
    })

    $("#chatList").html(chatsHtml);
    console.log(CHATS);
}

const renderChatList = chat => {
    let photourl = chat.clientPhoto ? chat.clientPhoto : 'https://i1.wp.com/www.essexyachtclub.co.uk/wp-content/uploads/2019/03/person-placeholder-portrait.png?fit=500%2C500&ssl=1';
    return `
            <li class="nav-item">
                <a href = "#" onclick = "viewChat('${chat.chatId}')">
                    <div class="avatar mx-auto white "><img src="${photourl}"
                        alt="avatar mx-auto white" class="rounded-circle img-fluid">
                        <h6 class="card-title mt-1 text-dark">${chat.clientName}</h6>
                    </div>
                </a>
            </li>
            `;
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
            console.log(CHAT_MESSAGES);
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

    $("#chatTextForm").css("display", "block");
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

    $('#chatsParent').animate({
        scrollTop: $('#chatsContainer').height()
    }, 1000);
}

const renderSenderChat = chat => {

    let momentDate = new moment(Math.abs(chat.timestamp));
    let timeago = momentDate.fromNow();
    let l = chat.senderName[0]

    return `
        <div class="d-flex flex-row-reverse">
            <div class="chat list-group-item shadow client-msg py-3 text-right">
                <div class="d-flex m-0 p-0 text-muted">
                    <p class="mr-auto p-2"><small><em>${chat.senderName}</em></small></p>
                    <p class="p-2"><small><em>${timeago}</em></small></p>
                </div>
                <p class="mb-0"></i>${chat.message} <span class="border rounded-circle px-3 py-2 bg-default text-white ml-3">${l.toUpperCase()}</span></p>
            </div>
        </div>
        `
}

const renderReceiverChat = (chat) => {
    let momentDate = new moment(Math.abs(chat.timestamp));
    let timeago = momentDate.fromNow();
    let l = chat.senderName[0];
    return `
        <div class="d-flex flex-row">
            <div class="chat list-group-item shadow lawyer-msg py-3">
                <div class="d-flex text-muted m-0 p-0">
                    <p class="mr-auto p-2"><small><em>${chat.senderName}</em></small></p>
                    <p class="p-2"><small><em>${timeago}</em></small></p>
                </div>
                <p class="mb-0"><span class="border rounded-circle px-3 py-2 bg-default text-white mr-3">${l.toUpperCase()}</span> ${chat.message}</p>
            </div>
        </div>
        `
}

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


