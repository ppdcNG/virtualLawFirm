let TASKS = {};
$(document).ready(function () {
    fetchCases();
})


const fetchCases = async () => {
    let uid = $("#uid").val();
    let cases = await firebase.firestore().collection('lawyers').doc(uid).collection('tasks').get().catch((e) => { console.log(e) });
    let casesHtml = "";

    cases.forEach((value) => {
        let task = value.data();
        TASKS[value.id] = task;
        console.log(task);
        casesHtml += renderCases(task, value.id);
    });
    $("#loadingTasks").css('display', 'none');
    $("#casesTable").html(casesHtml);

}




const renderCases = (task, taskId) => {
    let formattedTimestamp = Math.abs(task.timestamp);
    let time = moment(formattedTimestamp).format("dddd, MMMM Do YYYY");
    return `<tr>
    <td>${task.client.displayName}</td>
    <td>${task.issue}</td>
    <th scope="row">${time}</th>
    <td>
      <button class="btn btn-default" data-toggle="modal" onclick = "viewClientDetails(${taskId})" data-target="#contactModal"><i class="far fa-caret-square-down"></i></button>
      <button class="btn" data-toggle="modal" onclick = "sheduleMetting(${taskId}) data-target="#meetingModal"><i class="far fa-calendar-alt"></i></button>
    </td>
</tr>`;
}


$("#scheduleMeetingForm").submit((e) => {
    e.preventDefault();
    let form = form2js("scheduleMeetingForm", ".");

    console.log(form);

})
