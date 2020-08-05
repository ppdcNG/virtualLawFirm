//find lawyer
let lawyersList = {};
var ISSUE = '1';
let TASKS = {};
let CATEGORIES = null;

$(document).ready((e) => {
    $.ajax({
        type: "POST",
        url: ABS_PATH + 'client/lawyerCategories',
        data: {},
        success: function (response) {
            CATEGORIES = response;
            $('.lt-btn-accent').each(function (index) {
                $(this).removeClass('disabled');
            })
        },
        error: function (e) {
            console.log(e);
        }
    });
});

const fetchLawyers = async type => {
    let categories = CATEGORIES[type];
    categories = categories.slice(0, 10);
    console.log(categories);
    $("#findALawyer").fadeOut();
    $("#loading").fadeIn();
    let lawyers = await firebase.firestore().collection('lawyers').where('portfolio.tags', 'array-contains-any', categories).get().catch((e) => {
        console.log(e);
    });

    let lawyersHTML = '';
    lawyers.forEach(lawyer => {
        let lawyerData = lawyer.data();

        lawyersList[lawyer.id] = lawyerData;
        lawyersHTML += renderFoundLawyer(lawyer.data());
    });

    if (!lawyersHTML) {
        lawyersHTML += "No Lawyers Found under the Category"
    }
    $("#loading").css('display', 'none');
    $("#fetchMatchingLawyers").html(lawyersHTML);
    $("#matchingLawyersSection").css('display', 'block');

}

const consultLawyer = (lawyerId) => {
    let uid = $("#uid").val();
    console.log('consulting lawyer');
    if (!uid) {
        $("#loginModal").modal('show');
        return;
    }

    let fee = lawyersList[lawyerId].portfolio.consultationFee

    payWithPaystack(fee, lawyerId)
}



const renderFoundLawyer = lawyer => {
    let { contact, portfolio, name, authId } = lawyer;
    let fee = accounting.formatNumber(portfolio.consultationFee);

    return `
    <div class="col-md-4 mb-4">
       <div class="card h-100" style="background-color: #C8F2EF;">
          <div class="lawyer-card card-body" onclick = "consultLawyer('${lawyer.authId}')">
            <div class = "row">
                <div class="col-md-8 d-flex flex-column justify-content-center">
                    <h4 class="card-title font-weight-bold mr-auto mb-3">${name}</h4>
                    <div class="">
                    ${renderLawyerTags(portfolio.tags)}
                    </div>
                </div>
                <div class = "col-md-4 d-flex justify-content-center align-items-center">
                  <img src="${contact.photoUrl}" class="rounded-circle z-depth-0" style = "border: 1px solid var(--accent-colr)" alt="avatar image" height="70" width="70">
                </div>
            </div>
            <div class = "d-flex flex-row justify-content-between mt-4">
              <div>
                <span class = "lawyer-feature-header">Specialization</span>
                <span class = "lawyer-feature-value">${portfolio.specialization}</span>
              </div>
              <div>
                <span class = "lawyer-feature-header">Consultation Fee</span>
                <span class = "lawyer-feature-value">&#8358; ${fee}</span>
              </div>
              <div>
                <span class = "lawyer-feature-header">Years of Experience</span>
                <span class = "lawyer-feature-value">${portfolio.workExperience}</span>
              </div>
            </div>
          </div>
      </div>
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

$("#backToFindLawyer").click(function () {
    $("#findALawyer").fadeIn();
    $("#matchingLawyersSection").fadeOut();
});


const payWithPaystack = (fee, id) => {
    let lawyerInfo = lawyersList[id];
    fee = parseInt(fee);
    console.log(fee);
    let clientEmail = $('#clientEmail').val();
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
            $("#verifyModal").modal('show');
            let lawyer = {
                ...lawyerInfo.contact, email: lawyerInfo.email, uid: id, name: lawyerInfo.name, portfolio: lawyerInfo.portfolio
            }
            console.log(lawyer);
            let dataObj = {
                paystackRef: response.reference,
                lawyer,
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
                    $('#verifyStatus').text('Matter Created');
                    $("#verifyDescription").text('Your matter has been created and the lawyer has been notified, goto your dashboard to manage your matters')
                    $("#verifyIcon").fadeOut();
                    $("#verifyAnimation").fadeIn();
                    $("#verifyAnimation")[0].play();
                    $("#dashboardButton").fadeIn()
                    processingNotification.close();
                    $.notify(response.message, { type: response.status });

                },
                error: err => {
                    console.error("error", err)
                    $.notify(response.message, { type: "warning" });
                }
            });

        },
        onClose: function (e) {
            console.log(e)
            console.log('window closed');
            console.log('closed', close);
        }
    });
    handler.openIframe();
}



