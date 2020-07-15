let lawyersList = {};
var ISSUE = '1';
let TASKS = {};
var CHATS = [];
var CHAT_MESSAGES = [];
var Chatlistener = null;
var CHAT_ID = null;
var TASK_CATEGORIES = {};

var uid = $("#uid").val();


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
    $("#activeConsulting").text(closed);
    $("#closedConsulting").text(active);
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
                <a href = "/client/consultation/${id}/" class="btn btn-warning">Manage</a>
            </div>
            </div>
        </div>
    </div>
</div>
    `
}


