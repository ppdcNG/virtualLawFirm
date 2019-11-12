$("#lawyerContact").submit(async function (e) {
    console.log("lawyer Contact")
    e.preventDefault();
    var form = form2js("lawyerContact", ".");
    let uid = $("#uid").val();
    console.log(uid);
    let file = $("#profilePic")[0].files[0];
    let validImages = ['image/png', 'image/jpg', 'image/jpeg'];
    if (validImages.indexOf(file.type) < 0) {
        $.notify('Invalid File type provided. Valid Files' + validImages.join(' '), { type: "warning" });
        return false;
    }

    let task = await firebase.storage().ref('userfiles/' + uid).put(file);
    console.log(task);
    let url = await task.ref.getDownloadURL();

    form.photoUrl = url;





});