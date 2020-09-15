
var REQUESTS = {};
$('#myTabEx a[href="#createCourse"]').on('shown.bs.tab', function (e) {
    console.log('yayyy legal docs tab');
    if (is_empty(REQUESTS)) {
        fetchRequests();
    }
})




const fetchRequests = async () => {
    let requests = await firebase.firestore().collection('coursesProposal').get();
    let html = "";
    requests.forEach((req) => {
        let data = req.data();
        console.log(data);
        REQUESTS[req.id] = data;
        html += renderRequest(data);
    });
    $("#requestList").html(html);


}


const renderRequest = ({ name, email, profile, numberOfCourses, phone, subject, url }) => {
    return `<tr>
<td>${name}</td>
<td>${email}</td>
<td>${profile}</td>
<td>${phone}</td>
<td>${numberOfCourses}</td>
<td>${subject}</td>
<td><a target = "_blank"  href = "${url}"><i class = "fa fa-link"></i></a></td>
</tr>`
}