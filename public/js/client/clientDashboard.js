function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#chosenPic').attr('src', e.target.result);
        }

        reader.readAsDataURL(input.files[0]);
    }
}

$("#profilePic").change(function () {
    readURL(this);
});

$("#uploadPic").on("click", async function (e) {
    e.preventDefault();

    let form = form2js("uploadPic", ".");
    let uid = $("#uid").val();
    console.log(uid);
    let file = $("#profilePic")[0].files[0];
    let validImages = ['image/png', 'image/jpg', 'image/jpeg'];
    if (validImages.indexOf(file.type) < 0) {
        $.notify('Invalid File type provided. Valid Files' + validImages.join(' '), { type: "warning" });
        // clearLoad('uploadPic', 'Upload');
        return false;
    }

    let task = await firebase.storage().ref('userfiles/' + uid).put(file);
    let url = await task.ref.getDownloadURL();

    form.photoUrl = url;

    $.ajax({
        url: ABS_PATH + "",
        data: form,
        type: "POST",
        success: function (response) {
            // console.log(response);
            // if (!response.err) {
            //     $.notify("Saved!", { type: "success" });
            //     clearLoad('saveContact', 'Save');
            // } else {
            //     clearLoad('saveContact', 'Save');
            //     $.notify(response.message, { type: "warning" });
            // }
        },
        error: e => {
            console.log('error', e);
            clearLoad('uploadPic', 'Upload');
        }
    });

});

$("#settingsForm").submit(function (e) {
    e.preventDefault();
    let settings = form2js('settingsForm', '.', false);
    console.log(settings);
    buttonLoad('submitprofile');
    $.ajax({
        url: ABS_PATH + "client/updateSettings",
        data: settings,
        type: "POST",
        success: function (response) {
            console.log(response);
            clearLoad('submitprofile', 'Save Changes');
            if (!response.err) {
                $.notify(response.message, { type: "success" });

            } else {
                $.notify(response.message, { type: "warning" });
            }
        },
        error: e => {
            console.log('error', e);
            clearLoad('submitprofile', 'Save Changes');
        }
    });

});