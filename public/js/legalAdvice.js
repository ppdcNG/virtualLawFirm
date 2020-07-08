

$(document).ready(() => {
  fetchAdvices();
  $("#askLawyerButton").click((e) => {
    console.log('lawyer clicked')
    let uid = $("#uid").val();
    if (!uid) {
      $("#loginModal").modal('show');
    }
    else {
      let url = ABS_PATH + 'askLawyer';
      buttonLoadSpinner("askLawyerButton");
      $.ajax({
        type: "POST",
        url: url,
        data: { uid },
        dataType: "dataType",
        success: function (response) {
          console.log(response);
          $.notify('Preparing Chat')
          window.location = ABS_PATH + 'client/dashboard';
        }
      });
    }
  })
});



const fetchAdvices = async () => {

  $("#loadingTasks").css('display', 'block');
  let advises = await firebase.firestore().collection('questions').orderBy('timestamp').onSnapshot(handleFetchAdvises).catch((e) => { console.log(e) });
}

const handleFetchAdvises = advises => {
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
  buttonLoadSpinner('askQuestionButton');
  console.log(question);
  question.name = question.name || "";
  question.timestamp = 0 - new Date().getTime();
  let docRef = firebase.firestore().collection('questions').doc();
  let response = await docRef.set(question).catch((e) => { console.log(e) });
  not.close();
  clearLoad('askQuestionButton', "ASK");
  $("#legalAdvice")[0].reset();
  $.notify('Question Succesfully Submitted', { type: 'success' });

}


const renderAnswers = (question, id) => {

  let time = new moment(Math.abs(question.timestamp));
  let name = question.name || "Anonymous";
  let response = question.response || "No Response Yet";
  let subject = question.subject || "Question by " + name;


  return `
  <div class="">
  <!-- Card header -->
  <div class="card-header lt-soft-bg mt-3" style = "border-radius: 10px" role="tab">
    <a class="collapsed d-flex flex-row justify-content-between" data-toggle="collapse" data-parent="#questionsList" href="#accordion${id}"
      aria-expanded="false" aria-controls="accordion${id}">
      <div class = "start d-flex flex-row align-items-center">
        <img  src='https://i1.wp.com/www.essexyachtclub.co.uk/wp-content/uploads/2019/03/person-placeholder-portrait.png?fit=500%2C500&ssl=1' class="rounded-circle z-depth-1 m-2" style = "border: 1px solid var(--accent-colr)" alt="avatar image" height="50" width="50">
        <div class="">
          <h5 class = "lt-light-text m-0">${name}<h5>
          <label>${name}</label>
        </div>
      </div>
      
      <div class = "end d-flex flex-column justify-content-center align-items-center">
        <i class="fas fa-angle-down rotate-icon"></i>
        <p class="float-right"><small>${time.format('Do MMMM YYYY')}</small></p>
      </div>
      
    </a>
  </div>

  <!-- Card body -->
  <div id="accordion${id}" class="collapse" role="tabpanel" 
    data-parent="#questionsList">
    <div class="card-body">
      <h5>Question: </h5>
      <p class="text-justify">${question.text}</p>
      <hr/>
      <p class="text-justify">
      <h5>Advice: </h5>
      <p class="text-justify">${response}</p>
      </p>
    </div>
  </div> 
  </div>
    `
}

const buttonLoadSpinner = id => {
  $("#" + id).html('<i class="fas fa-spinner fa-pulse"></i>')
}