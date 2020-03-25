let lawyersList = {};
var ISSUE = '1';
var TASKS = {};
var CHATS = [];
var CHAT_MESSAGES = [];
var Chatlistener = null;
var CHAT_ID = null;

$(document).ready(function () {
    fetchCases();
    fetchChats();
})


const fetchCases = async () => {
    let uid = $("#uid").val();
    let cases = await firebase.firestore().collection('lawyers').doc(uid).collection('tasks').get().catch((e) => { console.log(e) });
    let casesHtml = "";

    cases.forEach((value) => {
        let task = value.data();
        TASKS[value.id] = task;
        console.log(task);
        casesHtml += renderCases(task, value.id);
    });
    $("#loadingTasks").css('display', 'none');
    $("#casesTable").html(casesHtml);

}


const renderCases = (task, taskId) => {
    let formattedTimestamp = Math.abs(task.timestamp);
    let time = moment(formattedTimestamp).format("dddd, MMMM Do YYYY");
    return `<tr>
        <td>${task.client.displayName}</td>
        <td>${task.subject}</td>
        <td>${task.status}</td>
        <th scope="row">${time}</th>
        <td>
            <button class="btn btn-default"  onclick = "viewClientDetails('${taskId}')" ><i class="far fa-caret-square-down"></i></button>
            <button class="btn" data-toggle="modal" data-target="#meetingModal"><i class="far fa-calendar-alt"></i></button>
            <button class="btn border" data-toggle="modal" data-target="#invoiceModal"><i class="fas fa-file-invoice"></i></button>
            <button class="py-2 px-4 border red-text" data-toggle="modal" data-target="#closeModal"><i class="fas fa-times"></i></button>
        </td>
    </tr>`;
}

$("#scheduleMeetingForm").submit(e => {
    e.preventDefault();
})

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

});

const viewClientDetails = (id) => {

    let task = TASKS[id];
    renderTaskModal(task, id);
    $("#contactModal").modal('show');
}

const chatWithClient = () => {
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
    buttonLoad('chatWithClientButton');

    $.ajax({
        url,
        data: obj,
        type: "POST",
        success: async function (response) {
            console.log(response);
            clearLoad('chatWithClientButton', 'Chat');
            if (response.status == "success") {
                $("#contactModal").modal('hide');
                $('#mainTab li:nth-child(2) a').tab('show');
                await fetchChats();
            }
        },
        error: e => {
            console.log('error', e);
            clearLoad('chatWithClientButton', 'Chat');
        }
    });
}

const renderTaskModal = (task, taskId) => {

    $("#taskId").val(taskId);
    $("#clientName").text(task.client.name);
    $("#clientDetailsList").html(`
        <img src="${task.client.photoURL || image_placeholder}" class="rounded-circle z-depth-0 mr-2"
                    alt="lawyerPic" height="70"/>
        <hr width="50" />
        <ul class="list-group">
            <li class="list-group-item"><i class="fas fa-user float-left"></i>${task.client.displayName}</li>
            <li class="list-group-item"><i class="fas fa-mobile float-left"></i></i>${task.client.phoneNumber || "N/A"}</li>
            <li class="list-group-item"><i class="fas fa-at float-left"></i>${task.client.email || "N/A"}</li>
        </ul>
        <div class="list-group border p-2">
            <h6>Task Description</h6>
            <hr width="100" />
            <p class="text-justify">${task.issue}</p>
        </div>
    `);

}

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

const renderChatList = (chat) => {
    return `
    <li class="list-group-item mb-1">
        <a href = "#" onclick = "viewChat('${chat.chatId}')">
        <img src="${chat.clientPhoto}" class="rounded-circle z-depth-0 "
            alt="lawyer Pic" height="50" width="50"><br/>  ${chat.clientName} </a>
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

const renderSenderChat = (chat) => {

    let momentDate = new moment(Math.abs(chat.timestamp));
    let timeago = momentDate.fromNow();

    return `<div class="container align-self-end " style = "width: 50%">
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

    return `<div class="container" style = "width: 50%">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-2 h5 teal-text">${chat.senderName}</h5>
                    <small class = "text-muted">${timeago}</small>
                </div>
                <p class="mb-2 blue-grey-text">${chat.message}</p>
            </div>`;
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