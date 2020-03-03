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




const renderCases = task => {
    let user = task.user ? task.user.name : 'N/A';



    return `<tr>
    <th scope="row">1</th>
    <td>${user}</td>
    <td>${task.issue}</td>
    <td>
      <button class="btn btn-default" onclick= "viewUserContact('${task.user}')"data-toggle="modal" data-target="#contactModal">Contact</button>
      <button class="btn" data-toggle="modal" data-target="#chatModal">Chat</button>
      <button class="btn" data-toggle="modal" data-target="#meetingModal">Schedule Meeting</button>
    </td>
</tr>`;
}


$("#scheduleMeetingForm").submit((e) => {
    e.preventDefault();
    let form = form2js("scheduleMeetingForm", ".");

    console.log(form);

})
