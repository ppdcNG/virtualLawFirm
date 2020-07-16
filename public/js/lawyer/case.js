

var taskId = $("#taskId").val()
var uid = $("#uid").val();
var TASK = null;
$(document).ready(function () {
    listenForTaskchanges();
});



const listenForTaskchanges = () => {
    firebase.firestore().doc(`lawyers/${uid}/tasks/${taskId}`).onSnapshot(fetchCase)
}
const fetchCase = snapshot => {
    let task = snapshot.data();
    TASK = task;
    let clientHTML = renderClient(task.client);
    $("#client").html(clientHTML);
    console.log(task)

    $("#subject").text(task.title);
    $("#issue").text(task.issue || "");
    task.appointments ? renderAppointMents(task.appointments) : renderAppointMents([]);
    task.invoices ? renderInvoices(task.invoices) : renderInvoices([]);
}




const renderClient = client => {
    let photoURL = client.photoURL ? client.photoURL : 'https://i1.wp.com/www.essexyachtclub.co.uk/wp-content/uploads/2019/03/person-placeholder-portrait.png?fit=500%2C500&ssl=1'

    return `
    <div class = "mt-3 d-flex flex-column justify-content-center align-items-center px-3">
        <img id = "lawyerPhoto" src="${photoURL}" class="rounded-circle z-depth-0" style = "border: 1px solid var(--accent-colr)" alt="avatar image" height="150" width="150">
        <h5 class="card-title font-weight-bold mt-3 mb-1" id = "lawyerName">${client.displayName}</h5>
        <div class = "mt-3 d-flex flex-column justify-content-center">
                <button onclick = "chatWithClient()" id = "chatButton" class = "btn btn-expand lt-btn-secondary">Chat With Client</button> 
        </div>
    </div>
    `;
}





const renderInvoices = invoices => {
    if (is_empty(invoices)) {
        $("#invoices").html("You have no invoices yet");
        return;
    }
    let invoiceHTML = "No Invoices Yet";

    invoices.forEach((invoice, index) => {
        let Actionbutton = invoice.status == "paid" ? `<i class = "fa fa-check"></i>` : `<button data-toggle = "tooltip" onclick = "deleteInvoice('${index}')" title = "Delete Invoice" class= "btn btn-sm lt-btn-accent"><i class="fas fa-trash"></i></button>`;
        let amount = accounting.format(invoice.amount);
        let date = moment(parseInt(invoice.timestamp)).format('Mo MMM YY');
        invoiceHTML += `<tr>
                        <td>${invoice.subject}</td>
                        <td>${invoice.status}</td>
                        <td>${amount}</td>
                        <td>${date}</td>
                        <td>${Actionbutton}</td>
                        </tr>`
    });

    $("#invoices").html(invoiceHTML);

}


const renderAppointMents = appointments => {

    if (is_empty(appointments)) {
        $("#appointments").html("No scheduled appointsments yet");
        return
    }
    let apHTML = "No appointments Yet";
    appointments.forEach((ap, index) => {
        let date = moment(parseInt(ap.date)).format('Mo MMM YY');
        let start = moment(parseInt(ap.start)).format('HH:mm');
        let end = moment(parseInt(ap.end)).format("HH:mm");
        let url = ABS_PATH + 'meetings/' + ap.meetingId;


        apHTML += `<tr>
                        <td data-toggle = "tooltip" title = "${ap.title}">${truncate(ap.title, 15)}</td>
                        <td>${date}</td>
                        <td>${start} to ${end}</td>
                        <td><a href = "${url}" class = "btn btn-sm lt-btn-accent" data-toggle = "tooltip" title = "Go to Meeting"><i class="fas fa-video"></i></a>
                        <a onclick = "editMeeting('${index}')" class = "btn btn-sm lt-btn-secondary" data-toggle = "tootltip" title = "Edit Meeting"><i class="fas fa-pen"></i></a></td>
                        </tr>`
    });

    $("#appointments").html(apHTML);
}

$("#scheduleMeetingForm").submit(async function (e) {
    e.preventDefault();
    buttonLoadSpinner('addMeetingButton');
    let notification = $.notify('Please Wait...', { type: 'primary', delay: 0 });
    let meeting = form2js('scheduleMeetingForm', '.', false);
    console.log(meeting);
    let task = TASK;
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
    buttonLoadSpinner('editButton');
    let notification = $.notify('Please Wait...', { type: 'primary', delay: 0, z_index: 100000 });
    let meetingId = $("#meetingId").val();
    let meeting = TASK.appointments[meetingId];
    meeting.start = new Date(`${edit.date}T${edit.start}+01:00`).getTime();
    meeting.end = new Date(`${edit.date}T${edit.end}+01:00`).getTime();
    meeting.timestamp = 0 - new Date().getTime();
    meeting.date = new Date(edit.date).getTime();
    meeting.title = edit.title;
    TASK.appointments[meetingId] = meeting;
    let app = TASK.appointments;
    let sendObj = {
        app: JSON.stringify(app),
        taskId: meeting.taskId,
        lawyerId: meeting.lawyerId,
        clientId: meeting.clientId,
        apId: meetingId
    }


    this.reset();
    let url = ABS_PATH + `lawyer/editSchedule?meetingId=${meeting.meetingId}`;

    $.ajax({
        url,
        data: sendObj,
        type: "POST",
        success: async function (response) {
            console.log(response);
            clearLoad('editButton', 'Set');
            notification.close();
            if (response.status == "success") {
                cancelEdit();
                $.notify(response.message, { type: 'success', z_index: 100000 });
            }
            else {
                $.notify(response.message, { type: 'danger', z_index: 100000 });
            }
        },
        error: e => {
            console.log('error', e);
            $.notify(e.message, { type: 'danger' });
        }
    });

});

const editMeeting = (meetingId) => {
    let meeting = TASK.appointments[meetingId];
    console.log(meeting);
    meeting = { ...meeting, ...convertToFormTime(meeting) };
    // console.log(meeting);
    // meeting.date = moment(meeting.date).format('')
    $("#meetingId").val(meetingId);
    $("#scheduleMeetingForm").fadeOut();
    js2form('editScheduleForm', meeting);
    $("#editScheduleForm").fadeIn();
    $("#meetingModal").modal('show');
}

const convertToFormTime = meeting => {
    let date = moment(parseInt(meeting.date)).format('YYYY-MM-DD');
    let start = moment(parseInt(meeting.start)).format('HH:mm');
    let end = moment(parseInt(meeting.end)).format("HH:mm");

    return { start, date, end };

}

const cancelEdit = () => {
    $("#editScheduleForm")[0].reset();
    $("#editScheduleForm").fadeOut();
    $("#scheduleMeetingForm").fadeIn();
}


$("#invoiceForm").submit(async function (e) {
    e.preventDefault();
    buttonLoadSpinner('raiseInvoiceButton');
    let notification = $.notify('Please Wait...', { type: 'primary', delay: 0, z_index: 10031 });
    let invoice = form2js('invoiceForm', '.', false);
    let task = TASK
    invoice.timestamp = new Date().getTime();
    invoice.lawyerId = task.lawyerId;
    invoice.clientId = task.userId;
    invoice.lawyerName = task.lawyer.name;
    invoice.clientName = task.client.displayName;
    console.log(invoice);
    this.reset();
    let url = ABS_PATH + 'lawyer/raiseInvoice';

    $.ajax({
        url,
        data: invoice,
        type: "POST",
        success: async function (response) {
            console.log(response);
            $("#invoiceModal").modal('hide');
            clearLoad('raiseInvoiceButton', 'Submit');
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


const deleteInvoice = id => {
    $("#delId").val(id);
    $("#deleteModal").modal('show');
}


const yesDelete = () => {
    let id = $("#delId").val();
    console.log(id);
    id = parseInt(id);
    let inv = TASK.invoices[id];

    TASK.invoices.splice(id, 1);
    let invoices = JSON.stringify(TASK.invoices);
    let sendObj = {
        taskId: inv.taskId,
        lawyerId: inv.lawyerId,
        clientId: inv.clientId,
        invoice: invoices
    }
    let url = ABS_PATH + `lawyer/deleteInvoice`;
    $("#deleteModal").modal('hide');
    let notification = $.notify("Please Wait ...", { type: 'info', delay: 0, z_index: 10031 })
    $.ajax({
        url,
        data: sendObj,
        type: "POST",
        success: async function (response) {
            console.log(response);
            clearLoad('editButton', 'Set');
            notification.close();
            if (response.status == "success") {
                cancelEdit();
                $.notify(response.message, { type: 'success', z_index: 100000 });
            }
            else {
                $.notify(response.message, { type: 'danger', z_index: 100000 });
            }
        },
        error: e => {
            console.log('error', e);
            $.notify(e.message, { type: 'danger' });
        }
    });

}


const chatWithClient = () => {

    let task = TASK
    let obj = {
        clientName: task.client.displayName,
        clientId: task.client.uid,
        clientPhoto: task.client.photoURL,
        lawyerId: task.lawyer.uid,
        lawyerName: task.lawyer.name,
        lawyerPhoto: task.lawyer.photoUrl
    }

    let url = ABS_PATH + 'client/initiateChat';
    buttonLoadSpinner('chatButton');

    $.ajax({
        url,
        data: obj,
        type: "POST",
        success: async function (response) {
            console.log(response);
            clearLoad('chatButton', 'Chat');
            if (response.status == "success") {
                let location = ABS_PATH + 'lawyer/dashboard/#chat';
                window.location = location;
            }
        },
        error: e => {
            console.log('error', e);
            clearLoad('chatButton', 'Chat');
        }
    });
}

