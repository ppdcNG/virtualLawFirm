//find lawyer
let lawyersList = {};
var ISSUE = '1';
let TASKS = {};

async function handleFindLawyerSubmit(form, thisForm) {
    $(thisForm).closest('.col-md-4').parent().css('display', 'none');
    $("#loading").css('display', 'block');

    let lawyers = await firebase.firestore().collection('lawyers').where('portfolio.tags', 'array-contains-any', form.tags).get().catch((e) => {
        console.log(e);
    });

    let lawyersHTML = '';
    lawyers.forEach(lawyer => {
        let lawyerData = lawyer.data();
        lawyersList[lawyer.id] = lawyerData;
        lawyersHTML += foundMatchingLawyer(lawyer.data());
    });

    if (!lawyersHTML) {
        lawyersHTML += "No Lawyers Found under the Category"
    }
    $("#loading").css('display', 'none');
    $("#fetchMatchingLawyers").html(lawyersHTML);
    $("#fetchMatchingLawyerSection").css('display', 'block');
}

// submit selected categories
$("#categ--family-law").submit(async function (e) {
    e.preventDefault();
    let form = form2js("categ--family-law", ".");
    handleFindLawyerSubmit(form, this);
})

$("#categ--adminPublicLaw").submit(async function (e) {
    e.preventDefault();
    let form = form2js("categ--adminPublicLaw", ".");
    handleFindLawyerSubmit(form, this);
});
$("#categ--landProperty").submit(async function (e) {
    e.preventDefault();
    let form = form2js("categ--landProperty", ".");
    handleFindLawyerSubmit(form, this);
});
$("#categ--financeCommercial").submit(async function (e) {
    e.preventDefault();
    let form = form2js("categ--financeCommercial", ".");
    handleFindLawyerSubmit(form, this);
});
$("#categ--digitalEntertainmentSport").submit(async function (e) {
    e.preventDefault();
    let form = form2js("categ--digitalEntertainmentSport", ".");
    handleFindLawyerSubmit(form, this);
});
$("#categ--energyProjects").submit(async function (e) {
    e.preventDefault();
    let form = form2js("categ--energyProjects", ".");
    handleFindLawyerSubmit(form, this);
});
$("#categ--others").submit(async function (e) {
    e.preventDefault();
    let form = form2js("categ--others", ".");
    handleFindLawyerSubmit(form, this);
});
// submit select categories end 

const foundMatchingLawyer = lawyer => {
    let { contact, portfolio, name, authId } = lawyer;
    let fee = accounting.formatNumber(portfolio.consultationFee);

    return `<div class="col-md-6 mb-4">
                <div class="card h-100" style="background-color: #C8F2EF;">
                    <div class="card-body py-5">
                        <div class="d-flex mb-3">
                            <h4 class="card-title font-weight-bold py-3 mr-auto">${name}</h4>

                            <img src="${contact.photoUrl}" class="rounded-circle z-depth-0"
                                alt="avatar image" height="80" width="80">
                        </div>
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-warning btn-sm">${portfolio.specialization}</button><button class="btn btn-warning btn-sm"></button><button class="btn btn-warning btn-sm" onclick="payWithPaystack('${portfolio.consultationFee}', '${authId}')">Consult</button>
                        </div>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <span>Location: Lagos</span><span>Consultation Fee: &#8358;${fee}</span><span>Experience: ${portfolio.workExperience} years</span>
                    </div>
                </div>
            </div>
            `
}

$("#backToFindLawyer").click(function () {
    location.reload();
});

// $("#findLawyerForm").submit(async function (e) {
//     e.preventDefault();

//     let form = form2js("findLawyerForm", ".");
//     console.log(form);
//     ISSUE = JSON.stringify(form);

//     // $.notify(response.message, {type: "Searching Lawyers.." });

//     // form = JSON.stringify(form);

//     // let data = {data: form }
//     // console.log(data);
//     let data = {};
//     let lawyers = await firebase.firestore().collection('lawyers').where('portfolio.tags', 'array-contains-any', form.tags).get().catch((e) => {
//         console.log(e);
//     });
//     console.log('firbase done')
//     console.log(lawyers);
//     let lawyersHTML = '';
//     lawyers.forEach(lawyer => {
//         let lawyerData = lawyer.data();
//         lawyersList[lawyer.id] = lawyerData;
//         lawyersHTML += renderFoundLawyer(lawyer.data());
//     });
//     $("#fetchlawyersList").html(lawyersHTML);
//     $("#findLawyersSection").css('display', 'none');
//     $("#fetchLawyersSection").css('display', 'block');
//     clearLoad("next", "Next");
// });
// $("#prev").click(async function (e) {
//     $("#fetchLawyersSection").css('display', 'none');
//     $("#findLawyersSection").css('display', 'block');
// });
// const renderFoundLawyer = lawyer => {
//     let { contact, portfolio, name, authId } = lawyer;
//     let fee = accounting.formatNumber(portfolio.consultationFee);

//     return `<li class="list-group-item d-flex justify-content-between align-items-center">
//         <img src="${contact.photoUrl}" class="rounded-circle mr-1" alt="profile_pic" width="40" />
//         <span class="flex-fill">${name}</span><br />
//         <span class="flex-fill"><b>Specialization: </b>${portfolio.specialization}</span>
//         <span class="flex-fill"><b>Experience: ${portfolio.workExperience} Years</b></span>
//         <span class="badge badge-info badge-pill p-3" style="width:100px;">&#8358;<span style="font-size:larger">${fee}</span></span>
//         <a class="btn blue-text ml-4" onclick="payWithPaystack('${portfolio.consultationFee}', '${authId}')">Consult</a>
//     </li>
// `
// }

// Paystack
const payWithPaystack = (fee, id) => {
    let lawyer = lawyersList[id];
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
            let task = form2js("findLawyerForm", ".");
            console.log(task);
            task.lawyerId = id;
            console.log(id);
            console.log(lawyer);
            task.lawyer = {
                ...lawyer.contact, email: lawyer.email, uid: id, name: lawyer.name
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
            console.log('closed', response);
        }
    });
    handler.openIframe();
}

