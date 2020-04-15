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

const renderChatList = (chat) => {
    return `
    <li class="list-group-item mb-1">
        <a href = "#" onclick = "viewChat('${chat.chatId}')">
        <img src="${chat.clientPhoto}" class="rounded-circle z-depth-0 "
            alt="lawyer Pic" height="50" width="50"><br/>  ${chat.clientName} </a>
    </li>
    `;
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


const renderNotification = i => {
    let task = TASKS[i];
    let notifications = task.activities || []
    let typeDict = { payment: renderPaymentNotification, meeting: renderMeetingNotification };
    let noteHTML = '';
    notifications.forEach((note, noteId) => {
        noteHTML = typeDict[note.type](note, i, noteId);
    });
    console.log(noteHTML);
    $('#notificationList').html(noteHTML);
}

const renderCases = (task, taskId) => {
    let formattedTimestamp = Math.abs(task.timestamp);
    let time = moment(formattedTimestamp).format("dddd, MMMM Do YYYY");
    let count = task.activities ? countUnread(task.activities) : 0;
    let badge = count > 0 ? `<span class="badge badge-danger ml-2">${count}</span>` : "";
    return `<tr>
        <td>
        <a class="elegant-text" onclick = "viewClientDetails('${taskId}')"  data-toggle = "tooltip" title = "View client details">${task.client.displayName}</a></li>
        </td>
        <td><a class = "elegant-text" onclick = "viewTaskDetails('${taskId}')" data-toggle = "tooltip" title = "View task detials">${task.subject}</a></td>
        <td>${task.status}</td>
        <th scope="row">${time}</th>
        <td>
            <button class="btn special-color text-white mr-4" data-toggle="tooltip" title = "Notifications about your Case" onclick = "openNotificationModal('${taskId}')"><i class="far fa-bell pr-2"></i>${badge}</button>            
            <button class="btn" data-toggle="tooltip" title = "Schedule Meeting" onclick = "openMeetingModal('${taskId}')"><i class="far fa-calendar-alt"></i></button>
            <button class="btn border" data-toggle="modal" data-target="#invoiceModal"><i class="fas fa-file-invoice"></i></button>
            <button class="py-2 px-4 border red-text" data-toggle="modal" data-target="#closeModal"><i class="fas fa-times"></i></button>
        </td>
    </tr>`;
}

const renderMeeting = (meeting, meetingId, taskId) => {
    let date = moment(Math.abs(meeting.date)).format("ddd, MMMM Do YYYY");
    let start = moment(Math.abs(meeting.start)).format("h:mm a")
    let end = moment(Math.abs(meeting.end)).format("h:mm a")
    let time = moment(Math.timestamp()).fromNow();

    return `
    <li class="list-group-item">
        <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-2 h5">Lawtrella Meeting</h5>
            <small>last modified: ${time}</small>
        </div>.
        <p class="mb-2">Meet scheduled with <span class = "text-info">${meeting.clientName}</span> for the <span = class = "text-info">${date}</span> from <span = class = "text-info">${start}</span> to <span = class = "text-info">${end}</span>
        blandit.</p>
        <div class = "d-flex w-40">
            <a href = "#" class = "btn btn-outline-default"><i class="fas fa-video pr-2"></i> Join Meeting</a>
            <button onclick = "editmeetingSchedule('${taskId}','${meetingId}')" class = "btn btn-outline-default"><i class="fas fa-pencil pr-2"></i>Edit Schedule</button>
        </div>
    </li>`
}

