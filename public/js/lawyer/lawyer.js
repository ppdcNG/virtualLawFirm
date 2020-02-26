$(document).ready(function () {
    fetchCases();
})


const fetchCases = async () => {
    let uid = $("#uid").val();
    let cases = await firebase.firestore().collection('lawyers').doc(uid).collection('tasks').get().catch((e) => { console.log(e) });
    let casesHtml = "";

    cases.forEach((value) => {
        let task = value.data();
        console.log(task);
        // casesHtml += renderCases(task);
    });


}