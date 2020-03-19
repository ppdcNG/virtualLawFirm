

var dbPath = 'legalDocs/'
const uploadDocs = async () => {

    let notification = $.notify('Uploading Document...', { type: "info", delay: 0 });
    let doc = form2js('docform', '.');
    console.log(doc);
    let file = $("#docFile")[0].files[0];
    let uploadTask = await firebase.storage().ref(dbPath).put(file);
    let url = await uploadTask.ref.getDownloadURL();
    notification.update('title', 'Saving Document Details');
    console.log(url);
    doc.url = url;
    let serverEnpoint = ABS_PATH + '/admin/addDoc';
    $.ajax({
        type: "post",
        url: serverEnpoint,
        data: doc,
        success: function (response) {
            console.log(resonse);
            notification.update('title', response.message);
            notification.update('type', reponse.status);
            notification.update('delay', 2000);
        }
    });
}

