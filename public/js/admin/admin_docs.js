


var dbPath = 'legaldocs/'
var LEGAL_DOCS = {};
const uploadDocs = async () => {


    let doc = form2js('docForm', '.');
    console.log(doc);
    let file = $("#docFile")[0].files[0];
    if (!file) {
        $.notify('Please select a file for upload', { type: 'warning' });
        return;
    }
    let notification = $.notify('Uploading Document...', { type: "info", delay: 0 });
    doc.type = file.type;
    doc.filename = filename;
    let uploadTask = await firebase.storage().ref(filePath).put(file);
    let url = await uploadTask.ref.getDownloadURL();
    notification.update('title', 'Saving Document Details...');
    console.log(url);
    doc.url = url;
    let task = await firebase.firestore().collection('legalDocs').doc().set(doc).catch((e) => {
        console.log(e);
    });
    notification.close();
    $.notify('Document Added Successfully', { type: 'success' });;

}

const updateDoc = async id => {
    let notification = $.notify('Updating Document...', { type: "info", delay: 0 });
    let old = LEGAL_DOCS[id];
    let doc = form2js('docForm', '.');
    let file = $("#docFile")[0].files[0];
    if (file) {
        notification.update('title', 'Uploading Document..');
        ext = file.name.split('.').pop();
        let filename = `${doc.title}.${ext}`
        let filePath = `${dbPath}${filename}`
        let uploadTask = await firebase.storage().ref(filePath).put(file);
        let url = await uploadTask.ref.getDownloadURL();
        doc.url = url;
    }
    await firebase.firestore().collection('legalDocs').doc(id).update(doc);
    notification.close();
    $.notify('Document Updated Successfully', { type: 'success' });


}



$("#docForm").submit(async function (e) {
    e.preventDefault();
    let file = $("#docFile")[0].files[0];
    let mode = $("#mode").val();
    if (mode == "add") {
        await uploadDocs();
    }

    if (mode == 'edit') {
        let id = $("#docId").val();
        console.log(id);
        await updateDoc(id);
    }

    this.reset();

});

const fetchDocuments = async () => {
    $("#loadingDocs").css('display', 'block');

    firebase.firestore().collection('legalDocs').onSnapshot((documents) => {
        let documentsHTML = "";
        documents.forEach((doc) => {
            LEGAL_DOCS[doc.id] = doc.data();
            documentsHTML += renderDocuments(doc.id, doc.data());
        })
        documentsHTML == '' ? $("#documentList").html('No Documents Uploaded Yet') : $("#documentList").html(documentsHTML);
        $("#loadingDocs").css('display', 'none');
    });


}

const changeDocument = async (id) => {
    let doc = LEGAL_DOCS[id];
    js2form('docForm', doc);

}

const openAddDocumentModal = () => {
    $("#docForm")[0].reset();
    $("#mode").val('add');
    $("#uploadLegalDoc").modal('show');
}
///ON enter Event
$('#myTabEx a[href="#legalDocs"]').on('shown.bs.tab', function (e) {
    console.log('yayyy legal docs tab');
    if (is_empty(LEGAL_DOCS)) {
        fetchDocuments();
    }
})

const delDocument = () => {
    if (!delId) {
        return;
    }


}

const replaceDocument = id => {
    let document = LEGAL_DOCS[id];
    $("#docId").val(id);
    $("#mode").val('edit');
    js2form('docForm', document);
    $("#docMode").val('editing');
    $("#uploadLegalDoc").modal('show');
    $("#docForm input").trigger('change');
    $("#docForm textarea").trigger('change');
}
