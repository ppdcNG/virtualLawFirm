






$("#enrollButton").click(function (e) {
    e.preventDefault();

});


const enroll = (button) => {

    let uid = $("#uid").val();
    if (uid == false || uid == "false") {
        $("#loginModal").modal('show');
        return;
    }
    buttonLoadSpinner("enrollButton")
    let form = form2js('promoForm', '.', false);
    console.log(form)
    form.price = parseFloat(form.price);
    if (form.price == 0 || form.price == 'FREE') {
        freecourse(form);
    }
    else {
        payWithPaystack(form.price, form);
    }
}



const payWithPaystack = (fee, course) => {
    fee = parseFloat(fee).toFixed(2);
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
            let dataObj = {
                ...course,
                paystackRef: response.reference,

            }
            console.log(dataObj)
            let req = { 'data': JSON.stringify(dataObj) };

            var processingNotification = $.notify('Please Wait.. while we verify your payment and set you up payment, please wait', { type: "info", delay: 0 });

            $.ajax({
                url: ABS_PATH + "e-learning/verifyPurchase",
                type: "POST",
                data: req,
                success: function (response) {
                    console.log("success", response);
                    if (response.err) {
                        $.notify(response.message, { type: "warning" });
                        return;
                    }
                    // $('#verifyStatus').text('Course Added Your List');
                    // $("#verifyDescription").text('Your Purchase was successful. Go to your course list to begin learning')
                    // $("#verifyModal").modal('show');
                    processingNotification.close();
                    clearLoad('enrollButton', 'ENROLL NOW');
                    $.notify(response.message, { type: response.status });
                    setTimeout(() => {
                        window.location = ABS_PATH + 'e-learning/courseList'
                    }, 400)

                },
                error: err => {
                    console.error("error", err)
                    $.notify(response.message, { type: "warning" });
                    clearLoad('enrollButton', 'ENROLL NOW');
                }
            });

        },
        onClose: function (response) {
            console.log('window closed');
            console.log('closed', response);
            $.notify(response.message, { type: "warning" });
        }
    });
    handler.openIframe();
}

const freecourse = (form) => {
    console.log(form, 'free course');
    let not = $.notify("Please Wait..", { type: "info", delay: 0 })
    $.ajax({
        url: ABS_PATH + "e-learning/freecourse",
        data: form,
        type: "POST",
        success: function (response) {
            console.log(response)

            not.close()
            $.notify(response.message, { type: "info", delay: 2000 })
            if (response.err) {
                clearLoad('enrollButton', 'ENROLL NOW');
                return
            }
            $('#verifyStatus').text('Course Added Your List');
            $("#verifyDescription").text('Course added to your list. Redirecting to course list...');
            // $("#verifyModal").modal('show')
            clearLoad('enrollButton', 'ENROLL NOW');
            setTimeout(() => {
                window.location = ABS_PATH + 'e-learning/courseList'
            }, 400)
        },
        error: err => {
            console.error('error', err);
            $.notify(err.message, { type: "danger", delay: 3000 })
            clearLoad('enrollButton', 'ENROLL NOW');
        }
    })
}
