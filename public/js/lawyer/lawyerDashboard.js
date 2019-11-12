$("#lawyerContact").submit(async function (e) {
    e.preventDefault();

    var form = form2js("lawyerContact", ".");
    let file = $("#profilePic")[0].files[0];
    let validImages = ['image/png', 'image/jpg', 'image/jpeg'];
    if (validImages.indexOf(file.type) < 0) {
        $.notify('Invalid File type provided. Valid Files'.validImages.join(' '), { type: warning });
        return;
    }
    $.ajax()

});