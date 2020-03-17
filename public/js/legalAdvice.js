$(document).ready(() => {
    fetchAdvices();
})

const fetchAdvices = async () => {

    $("#loadingTasks").css('display', 'block');
    let advises = await firebase.firestore().collection('questions').orderBy('timestamp').get().catch((e) => { console.log(e) });
    let advisesHTML = '';
    let count = 0;
    advises.forEach(question => {
        let data = question.data();
        advisesHTML += renderAnswers(data, count);
        count++
    });
    $("#loadingTasks").css('display', 'none');
    $("#questionsList").append(advisesHTML);
}

$("#legalAdvice").submit((e) => {
    e.preventDefault();
    submitAdvice();
});


const submitAdvice = async () => {
    let question = form2js("legalAdvice", '.');
    let not = $.notify('Please Wait...', { type: 'info', delay: 0 });
    console.log(question);
    question.name = question.name || "";
    question.timestamp = 0 - new Date().getTime();
    let docRef = firebase.firestore().collection('questions').doc();
    let response = await docRef.set(question).catch((e) => { console.log(e) });
    not.close();
    $.notify('Question Succesfully Submitted', { type: 'success' });

}


const renderAnswers = (question, id) => {

    let time = new moment(Math.abs(question.timestamp));
    let name = question.name || "Anonymous";
    let response = question.response || "No Response Yet";


    return `
    <div class="">

    <!-- Card header -->
    <div class="card-header" role="tab">
      <a class="collapsed" data-toggle="collapse" data-parent="#questionsList" href="#accordion${id}"
        aria-expanded="false" aria-controls="accordion${id}">
        <h5 class="mb-0">
          Question By ${name} <i class="fas fa-angle-down rotate-icon"></i>
        </h5>
        <h4 class = "mb-0"> ${time.format('Do MMMM YYYY')}</h4>
      </a>
    </div>

    <!-- Card body -->
    <div id="accordion${id}" class="collapse" role="tabpanel" 
      data-parent="#questionsList">
      <div class="card-body">
        <p><b>Question</b> ${question.text}</p>
        <hr/>
        <p class="text-justify">
        <b>Advise</b> ${response}
        </p>
      </div>
    </div>

  </div>
    `
}