$("#lawyerContact").submit(async function (e) {
    console.log("lawyer Contact")
    e.preventDefault();
    let form = form2js("lawyerContact", ".");
    let uid = $("#uid").val();
    console.log(uid);
    let file = $("#profilePic")[0].files[0];
    let validImages = ['image/png', 'image/jpg', 'image/jpeg'];
    if (validImages.indexOf(file.type) < 0) {
        $.notify('Invalid File type provided. Valid Files' + validImages.join(' '), { type: "warning" });
        clearLoad('saveContact', 'Save');

        return false;
    }

    let task = await firebase.storage().ref('userfiles/' + uid).put(file);
    console.log(task);
    let url = await task.ref.getDownloadURL();

    form.photoUrl = url;

    $.ajax({
        url: ABS_PATH + "lawyer/updateContact",
        data: form,
        type: "POST",
        success: function (response) {
            console.log(response);
            if (!response.err) {
                $.notify("Saved!", { type: "success" });
                clearLoad('saveContact', 'Save');
            } else {
                clearLoad('saveContact', 'Save');
                $.notify(response.message, { type: "warning" });
            }
        },
        error: e => {
            console.log('error', e);
            clearLoad('saveContact', 'Save');
        }
    })

});

$("#updateRecord").submit(async function (e) {
    e.preventDefault();
    let form = form2js("updateRecord", ".", false);
    console.log(form);
    form = JSON.stringify(form);
    $.ajax({
        url: ABS_PATH + "lawyer/updateRecord",
        data: { data: form },
        type: "POST",
        success: function (response) {
            console.log(response);
            if (!response.err) {
                clearLoad('saveRecord', 'Save');
                $.notify("Saved!", { type: "success" });
            } else {
                clearLoad('saveRecord', 'Save');
                $.notify(response.message, { type: "warning" });
            }
        },
        error: e => {
            clearLoad('saveRecord', 'Save');
            console.log('error', e);
        }
    })

});