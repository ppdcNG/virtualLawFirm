let lawyersList = {};
var ISSUE = '1';
var TASKS = {};
var CHATS = [];
var CHAT_MESSAGES = [];
var Chatlistener = null;
var CHAT_ID = null;
var MEETINGS = [];

$(document).ready(function () {
    fetchCases();
    fetchChats();
})


const fetchCases = async () => {
    let uid = $("#uid").val();
    await firebase.firestore().collection('lawyers').doc(uid).collection('tasks').orderBy("timestamp").onSnapshot(handleCaseFetch).catch((e) => { console.log(e) });




}

const handleCaseFetch = cases => {
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
const openNotificationModal = i => {
    console.log('openning notification')
    renderNotification(i);
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
    TASKS[taskId].activities[noteId].read = true;
    let notification = TASKS[taskId].activities

    await firebase.firestore().collection('lawyers').doc(uid).collection('tasks').doc(taskId).update({ activities: notification }).catch((e) => {
        console.log(e);
    });
    renderNotification(taskId);

}


const openMeetingModal = async taskId => {
    let meetingRef = MEETINGS[taskId];
    let notification = $.notify('Please Wait...', { type: "primary", delay: 0 });
    let meetingsHTML = "";
    if (meetingRef) {
        console.log("theres meeting")
        Object.keys(meetingRef).forEach((meetingId) => {
            let meeting = meetingRef[meetingId];
            console.log(meetingId)
            meetingsHTML += renderMeeting(meeting, meetingId, taskId);
        });
        notification.close()

    }

    else {
        console.log("theres no meeting");
        let meetingSnapshot = await firebase.firestore().collection('meetingSchedules').doc(taskId).collection('meetings').get();
        MEETINGS[taskId] = {};
        meetingSnapshot.forEach((ref) => {
            let meeting = ref.data();
            console.log(meeting);
            MEETING[taskId][ref.id] = meeting;
            meetingsHTML += renderMeeting(meeting, ref.id, taskId);
        });
        notification.close();

    }
    $("#meetingList").html(meetingsHTML);
    $("#meetingModal").modal('show');





}


