

const fetchAdvices = async () => {

    $("#loadingTasks").css('display', 'block');
    let advises = await firebase.firestore().collection('questions').orderBy('timestamp').get().catch((e) => { console.log(e) });
    let advisesHTML = '';
    advises.forEach(question => {
        advisesHTML += renderAnswers(question);
    });
    $("#loadingTasks").css('display', 'none');
    $("#questionsList").append(advisesHTML);
}


const submitAdvice = () => {
    let question = form2js("questionForm", '.');
    console.log(question);
    question.timestamp = 0 - new Date().getTime();
    let docRef = firebase.firestore.collection('questions').doc();
    let response = await docRef.set(question);

}


const renderAnswers = question => {
    let time = new momment(Math.abs(question.timestamp));
    let name = question.asker || "Anonymous";
    let response = question.response || "No Response Yet";


    return `
    <div class="">

    <!-- Card header -->
    <div class="card-header" role="tab" id="headingTwo2">
      <a class="collapsed" data-toggle="collapse" data-parent="#accordionEx1" href="#collapseTwo21"
        aria-expanded="false" aria-controls="collapseTwo21">
        <h5 class="mb-0">
          Question By ${name} <i class="fas fa-angle-down rotate-icon"></i>
        </h5>
        <h4 class = "mb-0"> ${time.format('Do MMMM YYYY')}</h4>
      </a>
    </div>

    <!-- Card body -->
    <div id="collapseTwo21" class="collapse" role="tabpanel" aria-labelledby="headingTwo21"
      data-parent="#accordionEx1">
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