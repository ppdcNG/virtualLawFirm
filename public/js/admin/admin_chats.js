var Chatlistener = null;
var CHATS = [];
var CHAT_MESSAGES = [];


$('#myTabEx a[href="#chatTab"]').on('shown.bs.tab', function (e) {
    console.log('yayyy chats tab');
    if (is_empty(CHATS)) {
        fetchChats();
    }
})
const fetchChats = async () => {
    let myId = $("#uid").val();
    let chatsSnapshot = await firebase.firestore().collection('adminChats').get();
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
            <li class="nav-item mb-3">
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
        chathtml += chat.senderId == "admin" ? renderSenderChat(chat) : renderReceiverChat(chat);
    })
    console.log(chathtml);

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
                <p class="mb-0"></i>${chat.message} <span class="border rounded-circle px-3 py-2 bg-default text-white ml-3">${l}</span></p>
            </div>
        </div>
        `
}

const renderReceiverChat = (chat) => {
    let momentDate = new moment(Math.abs(chat.timestamp));
    let timeago = momentDate.fromNow();
    let l = chat.senderName[0]
    return `
        <div class="d-flex flex-row">
            <div class="chat list-group-item shadow lawyer-msg py-3">
                <div class="d-flex text-muted m-0 p-0">
                    <p class="mr-auto p-2"><small><em>${chat.senderName}</em></small></p>
                    <p class="p-2"><small><em>${timeago}</em></small></p>
                </div>
                <p class="mb-0"><span class="border rounded-circle px-3 py-2 bg-default text-white mr-3">${l}</span> ${chat.message}</p>
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
    let chat = {
        senderId: 'admin',
        chatId,
        message,
        timestamp: 0 - new Date().getTime(),
        senderName: "Lawtrella Admin"
    }
    let docref = firebase.firestore().collection('chats').doc(chatId);
    return await docref.update({
        messages: firebase.firestore.FieldValue.arrayUnion(chat)
    });

}
