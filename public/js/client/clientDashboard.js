function readURL(input, id) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            // $('#chosenPic').attr('src', e.target.result);
            $('#' + id).attr('src', e.target.result);
        }

        reader.readAsDataURL(input.files[0]);
    }
}

$("#profilePic").change(function () {
    readURL(this, 'chosenPic');
});

$("#idcard").change(function () {
    readURL(this, 'chosenIdDoc');
});

// upload profile pic
$("#uploadPic").submit(async function (e) {
    e.preventDefault();

    let form = form2js("uploadPic", ".");
    let uid = $("#uid").val();
    console.log(uid);
    let file = $("#profilePic")[0].files[0];
    let validImages = ['image/png', 'image/jpg', 'image/jpeg'];
    if (validImages.indexOf(file.type) < 0) {
        $.notify('Invalid File type provided. Valid Files' + validImages.join(' '), { type: "warning" });
        clearLoad('uploadPicBtn', 'Upload');
        return false;
    }

    let task = await firebase.storage().ref('userfiles/' + uid).put(file);
    let url = await task.ref.getDownloadURL();

    form.url = url;
    form.type = "profilePic"

    console.table(form)

    $.ajax({
        url: ABS_PATH + "client/updateProfile",
        data: form,
        type: "POST",
        success: function (response) {
            $("#closeProfileModal").trigger("click");
            console.log(response);
            if (!response.err) {
                $.notify("Saved!", { type: "success" });
            } else {
                $.notify(response.message, { type: "warning" });
            }

            clearLoad('uploadPicBtn', 'Upload');
            location.reload();
        },
        error: err => {
            console.error('error', err);
            clearLoad('uploadPicBtn', 'Upload');
        }
    })

});

// upload id card
$("#uploadID").submit(async function (e) {
    e.preventDefault();

    let form = form2js("uploadID", ".");
    let uid = $("#uid").val();
    console.log(uid);

    let file = $("#idcard")[0].files[0];
    let validImages = ['image/png', 'image/jpg', 'image/jpeg'];
    if (validImages.indexOf(file.type) < 0) {
        $.notify('Invalid File type provided. Valid Files' + validImages.join(' '), { type: "warning" });
        clearLoad('uploadIdBtn', 'Upload');
        return false;
    }

    let task = await firebase.storage().ref('idcards/' + uid).put(file);
    let url = await task.ref.getDownloadURL();

    form.url = url;
    form.type = "idCard"

    console.table(form)

    $.ajax({
        url: ABS_PATH + "client/updateProfile",
        data: form,
        type: "POST",
        success: function (response) {
            console.log(response);
            if (!response.err) {
                $.notify("Saved!", { type: "success" });
            } else {
                $.notify(response.message, { type: "warning" });
            }
            clearLoad('uploadIdBtn', 'Upload');
            location.reload();
        },
        error: err => {
            console.error('error', err);
            clearLoad('uploadIdBtn', 'Upload');
        }
    })

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

//find lawyer
$("#findLawyerForm").submit(async function (e) {
    e.preventDefault();

    let form = form2js("findLawyerForm", ".");
    console.log(form);
    // form = JSON.stringify(form);

    // let data = { data: form }
    // console.log(data);
    let data = {};
    let lawyers = await firebase.firestore().collection('lawyers').where('portfolio.tags', 'array-contains-any', form.tags).get().catch((e) => {
        console.log(e);
    });
    console.log('firbase done')
    console.log(lawyers);
    lawyers.forEach(lawyer => {
        data[lawyer.id] = lawyer.data();
    });

    console.log(data);

    $("#findLawyersSection").css('display', 'none');
    $("#fetchLawyersSection").css('display', 'block');
    clearLoad("next", "Next");

    let newSection = "";

    for (let i in data) {
        let { name, contact, portfolio } = data[i];

        newSection +=
            `<li class="list-group-item d-flex justify-content-between align-items-center">
                <img src="${contact.photoUrl}" class="rounded-circle mr-1" alt="profile_pic" width="40"/>
                <span class="flex-fill">${name}</span><br/>
                <span class="badge badge-info badge-pill p-3">&#8358;<span style="font-size:larger">${portfolio.consultationFee}</span></span>
                <a class="btn blue-text ml-4">select</a>
            </li>
            `
    }
    $("#fetchlawyersList").empty();
    $("#fetchlawyersList").append(newSection);

    // $.ajax({
    //     url: ABS_PATH + "client/fetchLawyers",
    //     data: { data: form },
    //     type: "POST",
    //     success: function (response) {
    //         if (!response.err) {
    //             $.notify("Loading..", { type: "success" });

    //         } else {
    //             $.notify(response.message, { type: "warning" });
    //         }
    //     },
    //     error: e => {
    //         console.log('error', e);
    //     }
    // })

});

$("#prev").click(async function (e) {
    $("#fetchLawyersSection").css('display', 'none');
    $("#findLawyersSection").css('display', 'block');
})
