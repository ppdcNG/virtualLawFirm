


var dbPath = 'legaldocs/'
var LEGAL_DOCS = {};
const uploadDocs = async () => {

    let notification = $.notify('Uploading Document...', { type: "info", delay: 0 });
    let doc = form2js('docForm', '.');
    console.log(doc);
    let file = $("#docFile")[0].files[0];
    ext = file.name.split('.').pop();
    let filename = `${doc.title}.${ext}`
    let filePath = `${dbPath}${filename}`;
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



$("#docForm").submit(async function (e) {
    e.preventDefault();
    let file = $("#docFile")[0].files[0];
    await uploadDocs();
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
