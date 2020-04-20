let lawyersList = {};
var ISSUE = '1';
var TASKS = {};
var CHATS = [];
var CHAT_MESSAGES = [];
var Chatlistener = null;
var CHAT_ID = null;
var MEETINGS = {};

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
    let notification = TASKS[taskId].activities;

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
            MEETINGS[taskId][ref.id] = meeting;
            meetingsHTML += renderMeeting(meeting, ref.id, taskId);
        });
        notification.close();

    }
    $("#meetingList").html(meetingsHTML);
    $(".taskId").each((id, ele) => { $(ele).val(taskId) });
    $("#meetingModal").modal('show');

}

$("#scheduleMeetingForm").submit(async function (e) {
    e.preventDefault();
    buttonLoad('addMeetingButton');
    let notification = $.notify('Please Wait...', { type: 'primary', delay: 0 });
    let meeting = form2js('scheduleMeetingForm', '.', false);
    console.log(meeting);
    let task = TASKS[meeting.taskId];
    let endstring = `${meeting.date}T${meeting.start}Z`
    console.log(endstring);
    meeting.start = new Date(`${meeting.date}T${meeting.start}+01:00`).getTime();
    meeting.end = new Date(`${meeting.date}T${meeting.end}+01:00`).getTime();
    meeting.timestamp = 0 - new Date().getTime();
    meeting.date = new Date(meeting.date).getTime();
    meeting.lawyerId = task.lawyerId;
    meeting.clientId = task.userId;
    meeting.lawyerName = task.lawyer.name;
    meeting.clientName = task.client.displayName;

    this.reset();
    let url = ABS_PATH + 'lawyer/scheduleMeeting';

    $.ajax({
        url,
        data: meeting,
        type: "POST",
        success: async function (response) {
            console.log(response);
            clearLoad('addMeetingButton', 'Set');
            notification.close();
            if (response.status == "success") {
                $.notify(response.message, { type: 'success' });
            }
            else {
                $.notify(response.message, { type: 'danger' });
            }
        },
        error: e => {
            console.log('error', e);
            $.notify(e.message, { type: 'danger' });
        }
    });


});

$("#editScheduleForm").submit(function (e) {
    e.preventDefault();
    let edit = form2js('editScheduleForm', '.', false);
    console.log(edit);
    buttonLoad('editButton');
    let notification = $.notify('Please Wait...', { type: 'primary', delay: 0 });
    let meetingId = $("#meetingId").val();
    let meeting = MEETINGS[edit.taskId][meetingId];
    meeting.start = new Date(`${edit.date}T${edit.start}+01:00`).getTime();
    meeting.end = new Date(`${edit.date}T${edit.end}+01:00`).getTime();
    meeting.timestamp = 0 - new Date().getTime();
    meeting.date = new Date(edit.date).getTime();


    this.reset();
    let url = ABS_PATH + `lawyer/editSchedule?meetingId=${meetingId}`;

    $.ajax({
        url,
        data: meeting,
        type: "POST",
        success: async function (response) {
            console.log(response);
            clearLoad('editButton', 'Set');
            notification.close();
            if (response.status == "success") {
                $.notify(response.message, { type: 'success' });
            }
            else {
                $.notify(response.message, { type: 'danger' });
            }
        },
        error: e => {
            console.log('error', e);
            $.notify(e.message, { type: 'danger' });
        }
    });

})

const editMeeting = (taskId, meetingId) => {
    let meeting = MEETINGS[taskId][meetingId];
    console.log(meeting);
    meeting = { ...meeting, ...convertToFormTime(meeting) };
    // console.log(meeting);
    // meeting.date = moment(meeting.date).format('')
    $("#meetingId").val(meetingId);
    $("#scheduleMeetingForm").fadeOut();
    js2form('editScheduleForm', meeting);
    $("#editScheduleForm").fadeIn();
}

const cancelEdit = () => {
    $("#editScheduleForm")[0].reset();
    $("#editScheduleForm").fadeOut();
    $("#scheduleMeetingForm").fadeIn();
}

const convertToFormTime = meeting => {
    let date = moment(parseInt(meeting.date)).format('YYYY-MM-DD');
    let start = moment(parseInt(meeting.start)).format('HH:mm');
    let end = moment(parseInt(meeting.end)).format("HH:mm");

    return { start, date, end };

}


