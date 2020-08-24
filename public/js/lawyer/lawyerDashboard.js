var documents = [];

$("#lawyerContact").submit(async function (e) {

    e.preventDefault();
    console.log("lawyer Contact")
    let form = form2js("lawyerContact", ".");
    let uid = $("#uid").val();
    console.log(uid);
    buttonLoad('saveContact');
    let file = $("#profilePic")[0].files[0];
    let validImages = ['image/png', 'image/jpg', 'image/jpeg'];
    if (file && validImages.indexOf(file.type) < 0) {
        $.notify('Invalid File type provided. Valid Files' + validImages.join(' '), { type: "warning" });
        clearLoad('saveContact', 'Save');

        return false;
    }

    if (file) {
        let task = await firebase.storage().ref('userfiles/' + uid).put(file);
        console.log(task);
        let url = await task.ref.getDownloadURL();

        form.photoUrl = url;
    }


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
    buttonLoad('saveRecord');
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

// $("#selectDoc").submit(async function (e) {
//     e.preventDefault();
//     let doc = form2js("selectDoc", '.');
//     console.log(doc);
//     let uid = $("#uid").val();
//     let path = 'lawyerdocs/' + uid + '/' + doc.title;
//     let file = $("#docFile")[0].files[0];
//     let task = await firebase.storage().ref(path).put(file);
//     console.log(task);
//     let url = await task.ref.getDownloadURL()
//     console.log(url);
//     doc.url = url;
//     documents.push(doc);
//     renderDocuments();

//     clearLoad('saveDoc', 'Save');
//     $("#selectDoc").trigger("reset");

// });


const renderDocument = (i, document) => {
    return `
        <div class="col-md-3">
            <div class="card">
                <div class="card-body">
                    <h4 class="card-title"><a>${document.title}</a></h4>
                    <button onclick="removeDocument('${i}')" class="btn btn-danger">Delete</button>
                </div>
            </div>
        </div>
    `
}

const renderDocuments = () => {
    let docHTML = '';
    documents.map((doc, i) => {
        docHTML += renderDocument(i, doc);
    });
    $("#uploadedDocs").html(docHTML);
}

const removeDocument = async i => {
    let doc = documents[i];
    let uid = $("#uid").val();
    let path = 'lawyerdocs/' + uid + '/' + doc.title;
    await firebase.storage().ref(path).delete();
    documents.splice(i, 1);
    renderDocuments();
}

$("#updateUpload").submit(async function (e) {
    e.preventDefault();
    let form = form2js("updateUpload", ".");
    form = JSON.stringify(form);
    buttonLoad('saveUpload')
    $.ajax({
        url: ABS_PATH + "lawyer/updateUploads",
        data: { data: form },
        type: "POST",
        success: function (response) {
            console.log(response);
            if (!response.err) {
                clearLoad('saveUpload', 'Submit');
                $.notify("Saved!", { type: "success" });
            } else {
                clearLoad('saveUpload', 'Submit');
                $.notify(response.message, { type: "warning" });
            }
        },
        error: e => {
            clearLoad('saveUpload', 'Submit');
            console.log('error', e);
        }
    });


});

$(document).ready(() => {
    let url = ABS_PATH + 'lawyer/lawyerDetails';
    $.ajax({
        type: "POST",
        url: url,
        data: "data",
        success: function (response) {
            console.log(response);
            let { accountDetails, record, contact, portfolio, docs } = response;
            documents = docs ? docs : [];
            if (contact) updateContactForm(contact);
            if (record) updateRecordForm(record, accountDetails);
            if (portfolio) updateUploadForm(portfolio)


        }
    });
});

const updateContactForm = contact => {
    if (!contact) {
        return;
    }
    console.log(contact);
    js2form('lawyerContact', contact, '.');
    $("#state").val(contact.state).trigger('change');
    $('#lawyerContact input').trigger('change');
    $('#lawyerContact textarea').trigger('change');
}

const updateRecordForm = (record, accountDetails) => {
    if (!record || !accountDetails) {
        return;
    }
    console.log(record, accountDetails);
    record.accountDetails = accountDetails;
    js2form('updateRecord', record, '.');
    $('#updateRecord input').trigger('change');

}

const updateUploadForm = portfolio => {
    if (!portfolio) {
        return;
    }
    js2form('updateUpload', portfolio, '.');
    renderDocuments();
    $('#updateUpload input').trigger('change');
    $('#updateUpload select').trigger('change');
}
