$("#lawyerContact").submit(function (e) {
    e.preventDefault();

    var form = form2js("lawyerContact", ".");

    $.ajax({
        url: ABS_PATH + "lawyer/updateContact",
        data: form,
        type: "POST",
        success: function (response) {
            console.log(response);
            if (!response.err) {
                $.notify("User created successfully", { type: "success" });
                setTimeout(function () { window.location = ABS_PATH + 'lawyer/login' }, 2000);
            } else {
                $.notify(response.message, { type: "warning" });
            }
        },
        error: e => console.log(e)
    });

});