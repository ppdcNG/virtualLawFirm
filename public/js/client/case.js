

var taskId = $("#taskId").val()
var uid = $("#uid").val();
TASK = null

$(document).ready(function () {
    listenForTaskchanges();
});

$("#editIssueForm").submit(function (e) {
    e.preventDefault();
    editTask();
});
const listenForTaskchanges = () => {
    firebase.firestore().doc(`clients/${uid}/tasks/${taskId}`).onSnapshot(fetchCase)
}

const fetchCase = snapshot => {

    let task = snapshot.data();
    TASK = task;
    let lawyerHTML = renderLawyer(task.lawyer);
    $("#lawyer").html(lawyerHTML);
    console.log(task)

    $("#subject").val(task.title);
    $("#issue").val(task.issue || "");
    $("#formSubject").val(task.subject);
    task.appointments ? renderAppointMents(task.appointments) : renderAppointMents([]);
    task.invoices ? renderInvoices(task.invoices) : renderInvoices([]);
}

const editTask = async () => {
    buttonLoadSpinner('saveIssueButton');
    let data = form2js('editIssueForm', '.', false);
    let not = $.notify("Please Wait...", { type: "primary", delay: 0 });

    await firebase.firestore().doc(`clients/${uid}/tasks/${taskId}`).update(data);
    not.close();
    $.notify("Task Edited", { type: "success", delay: 15000 });
    clearLoad('saveIssueButton', "Save");


}


const renderLawyer = lawyer => {
    let tags = renderLawyerTags(lawyer.portfolio.tags);

    return `
            <h4 class="mb-2">My Lawyer</h4>
            <div class = "mt-3 row px-3">
                <div class="col-md-6 d-flex flex-column justify-content-center ">
                    <div>
                        <h5 class="card-title font-weight-bold  mb-1" id = "lawyerName">${lawyer.name}
                        </h5>
                        <small id = "specialization" data-toggle = "tooltip" title = "${lawyer.portfolio.specialization}">${truncate(lawyer.portfolio.specialization, 39)}</small>
                    </div>
                    
                </div>
                <div class = "col-md-6 d-flex justify-content-end ">
                    <img id = "lawyerPhoto" src="${lawyer.photoUrl}" class="rounded-circle z-depth-0" style = "border: 1px solid var(--accent-colr)" alt="avatar image" height="70" width="70">
                </div>
            </div>
            <div class = " row mt-4 px-3">
                
                <div clasS = "col-sm-9 d-flex flex-column justify-content-center">
                    <div>
                        ${tags}
                    </div>
                </div>
                <div clasS = "col-sm-3 d-flex flex-column justify-content-center align-items-center">
                    <span class = "lawyer-feature-header">Year of Experience</span>
                    <span class = "lawyer-feature-value">${lawyer.portfolio.workExperience} yrs</span>
                </div>
            </div>
            <div class = "mt-5 d-flex flex-column justify-content-center">
                    <button onclick = "chatWithLawyer()"  class = "btn btn-expand lt-btn-accent">Chat With Lawyer</button> 
            </div>
    `;
}

const renderLawyerTags = tags => {
    let html = '';
    tags.forEach((value, index) => {
        html += `<span class = "lawyer-tags">${truncate(value, 15)}</span>`;
    });
    return html;
}



const renderInvoices = invoices => {
    if (is_empty(invoices)) {
        $("#invoices").html("You have no invoices yet");
        return;
    }
    let invoiceHTML = "No Invoices Yet";

    invoices.forEach((invoice, index) => {
        let Actionbutton = invoice.status == "paid" ? `<i class = "fa fa-check"></i>` : `<button data-toggle = "tooltip" onclick = "payInvoice('${index}')" title = "Pay Invoice" class= "btn btn-sm lt-btn-accent">Pay</button>`;
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
                    </td>
                    </tr>`
    });

    $("#appointments").html(apHTML);
}

const payInvoice = (id) => {

    let invoice = TASK.invoices[id];
    payInvoiceFee(invoice.amount, id);

}

const payInvoiceFee = (fee, invoiceId) => {
    fee = parseInt(fee);
    console.log(fee);
    let clientEmail = $('#clientEmail').val();
    let clientName = $('#displayName').val();
    let phoneNumber = $('#phoneNumber').val();
    let displayName = $("#displayName").val();


    var handler = PaystackPop.setup({
        key: PAYSTACK_KEY,
        email: clientEmail,
        amount: fee * 100,
        currency: "NGN",
        metadata: {
            custom_fields: [
                {
                    display_name: displayName,
                    variable_name: "mobile_number",
                    value: phoneNumber
                }
            ]
        },
        // on success 
        callback: function (response) {
            console.log(response);
            let task = TASK
            let invoices = JSON.stringify(TASK.invoices)
            let subject = TASK.invoices[invoiceId].subject;
            let dataObj = {
                paystackRef: response.reference,
                taskId,
                clientName: task.client.displayName,
                clientId: task.client.uid,
                clientPhoto: task.client.photoURL,
                lawyerId: task.lawyer.uid,
                lawyerName: task.lawyer.name,
                lawyerPhoto: task.lawyer.photoUrl,
                invoices,
                subject,
                invoiceId
            }
            console.log(dataObj)


            var processingNotification = $.notify('Processing payment, please wait', { type: "info", delay: 0, z_index: 10031 });

            $.ajax({
                url: ABS_PATH + "client/verifyInvoiceFee",
                type: "POST",
                data: dataObj,
                success: function (response) {
                    console.log("success", response);

                    processingNotification.close();
                    $.notify(response.message, { type: response.status });
                },
                error: err => {
                    console.error("error", err)
                    $.notify(response.message, { type: "warning" });
                }
            });

        },
        onClose: function () {
            console.log('window closed');
            console.log('closed', response);
        }
    });
    handler.openIframe();

}

const chatWithLawyer = () => {

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
                let location = ABS_PATH + 'client/dashboard/#chat';
                window.location = location;
            }
        },
        error: e => {
            console.log('error', e);
            clearLoad('chatButton', 'Chat');
        }
    });
}