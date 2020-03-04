//find lawyer
$("#findLawyerForm").submit(async function (e) {
    e.preventDefault();

    let form = form2js("findLawyerForm", ".");
    console.log(form);
    ISSUE = JSON.stringify(form);

    // $.notify(response.message, { type: "Searching Lawyers.." });

    // form = JSON.stringify(form);

    // let data = { data: form }
    // console.log(data);
    let data = {};
    let lawyers = await firebase.firestore().collection('lawyers').where('portfolio.tags', 'array-contains-any', form.tags).get().catch((e) => {
        console.log(e);
    });
    console.log('firbase done')
    console.log(lawyers);
    let lawyersHTML = '';
    lawyers.forEach(lawyer => {
        let lawyerData = lawyer.data();
        lawyersList[lawyer.id] = lawyerData;
        lawyersHTML += renderFoundLawyer(lawyer.data());
    });
    $("#fetchlawyersList").html(lawyersHTML);
    $("#findLawyersSection").css('display', 'none');
    $("#fetchLawyersSection").css('display', 'block');
    clearLoad("next", "Next");
});

const renderFoundLawyer = lawyer => {
    let { contact, portfolio, name, authId } = lawyer;
    let fee = accounting.formatNumber(portfolio.consultationFee);

    return `<li class="list-group-item d-flex justify-content-between align-items-center">
        <img src="${contact.photoUrl}" class="rounded-circle mr-1" alt="profile_pic" width="40"/>
        <span class="flex-fill">${name}</span><br/>
        <span class="flex-fill"><b>Specialization: </b>${portfolio.specialization}</span>
        <span class="flex-fill"><b>Experience: ${portfolio.workExperience} Years</b></span>
        <span class="badge badge-info badge-pill p-3" style="width:100px;">&#8358;<span style="font-size:larger">${fee}</span></span>
        <a class="btn blue-text ml-4" onclick="payWithPaystack('${portfolio.consultationFee}', '${authId}')">Consult</a>
    </li>
`
}

// Paystack
const payWithPaystack = (fee, id) => {
    let laywer = lawyersList[id];
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
            let task = form2js("findLawyerForm", ".");
            task.lawyerId = id;
            task.lawyer = laywer.contact;
            task.lawyer.email = lawyer.email
            console.log('task', task);

            if (!task.lawyer.phoneNumber) {
                task.lawyer.phoneNumber = '';
            }
            if (!task.lawyer.photoUrl) {
                task.lawyer.photoUrl = '';
            }

            let dataObj = {
                paystackRef: response.reference,
                task,
                lawyerId: id
            }
            console.log(dataObj)
            let req = { 'data': JSON.stringify(dataObj) };

            var processingNotification = $.notify('Processing payment, please wait', { type: "info", delay: 0 });

            $.ajax({
                url: ABS_PATH + "client/verifyConsultationFee",
                type: "POST",
                data: req,
                success: function (response) {
                    console.log("success", response);

                    processingNotification.close();
                    $.notify(response.message, { type: response.status });

                    setTimeout(() => {
                        window.location = '/client/dashboard';
                    }, 1000)
                },
                error: err => {
                    console.error("error", err)
                    $.notify(response.message, { type: "warning" });
                }
            });

        },
        onClose: function () {
            console.log('window closed');
        }
    });
    handler.openIframe();
}