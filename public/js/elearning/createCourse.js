


let screenElements = ["about-section", 'form-section', 'personalDetailsForm', 'courseDetailsForm'];
let personal_details = null;
var dbPath = 'synopses_proposal/';
$("#personalDetailsForm").submit(function (e) {
    e.preventDefault();
    personal_details = form2js('personalDetailsForm', '.', false);
    nextForm();
});

$("#courseDetailsForm").submit(async function (e) {
    e.preventDefault();
    buttonLoadSpinner('submitProposalButton');
    let course_details = form2js('courseDetailsForm', '.', false);
    let data = { ...personal_details, ...course_details };
    let file = $("#synopses")[0].files[0];
    if (!file) {
        $.notify('Please select a file for upload', { type: 'warning' });
        $('#synopses').addClass('is-invalid');
        clearLoad('submitProposalButton', 'SUBMIT PROPOSAL')
        return;
    }

    let ext = file.name.split('.').pop();
    let filename = `propsal-` + personal_details.email;
    let filePath = `${dbPath}`

    let uploadTask = await firebase.storage().ref(filePath).put(file).catch(e => {
        console.log(e);
        showError(e.message);
        clearLoad('submitProposalButton', 'SUBMIT PROPOSAL');
    })
    let url = await uploadTask.ref.getDownloadURL();
    data.url = url;
    let success = await firebase.firestore().collection('coursesProposal').doc().set(data).catch(e => {
        console.log(e);
        showError(e.message)
        clearLoad('submitProposalButton', 'SUBMIT PROPOSAL');
        return;
    });

    console.log('success')
    $("#personalDetailsForm")[0].reset();
    $("#courseDetailsForm")[0].reset();
    $.notify('Your Proposal has been submitted successfully we will be in touch', { type: "success", delay: 1500 })
    clearLoad('submitProposalButton', 'SUBMIT PROPOSAL');
    showAbout();



});
const showError = message => {
    $("#formError").html(message).removeClass('valid')
}
const showForms = () => {
    $("#about-section").removeClass('d-flex').fadeOut();
    $("#form-section").css('display', 'flex');
    $("#personalDetailsForm").fadeIn();
}
const showAbout = () => {
    $("#about-section").addClass('d-flex').fadeIn();
    $("#form-section").css('display', 'none');
    $("#personalDetailsForm").fadeOut();
    $("#courseDetailsForm").fadeOut();
}

const nextForm = () => {
    $("#personalDetailsForm").fadeOut();
    $("#courseDetailsForm").fadeIn();
    $("#about-section").removeClass('d-flex').fadeOut();

}
const prevForm = () => {
    $("#personalDetailsForm").fadeIn();
    $("#courseDetailsForm").fadeOut();
    $("#about-section").removeClass('d-flex').fadeOut();

}





