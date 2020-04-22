const renderLawyers = (lawyers) => {
  // lawyers = [{ fullname, status, id.....}...]
}

const renderCases = (task, taskId) => {
  let formattedTimestamp = Math.abs(task.timestamp);
  let time = moment(formattedTimestamp).format("dddd, MMMM Do YYYY");
  return `<tr>
      <td>${task.subject || "N/A"}</td>
      <td>${task.client.displayName}</td>
      <th>${task.status || "N/A"}</th>
      <td>${task.lawyer.name || "N/A"}</td>
      <td>${time}</td>
      <td class="d-flex justify-content-center">
        <button class="btn btn-default" data-toggle = "tooltip" title = "View Case Details" data-toggle="modal" data-target="#taskDetailsModal"  onclick = "viewCase('${taskId}')" ><i class="far fa-eye"></i></button>
        <button class="btn btn-default" data-toggle ="tooltip" title="Contact" onclick="contactModal()"><i class="fas fa-paper-plane"></i></button>
        <button class="btn" data-toggle="tooltip" title="History" onclick="historyModal('${taskId}')"><i class="far fa-file"></i></button>
      </td>
  </tr>`;
}

const renderTable = (i, lawyer) => {
  return `
        <tr>
            <th scope="row">${Object.keys(lawyers).indexOf(i) + 1}</th>
            <td>${lawyer.name}</td>
            <td>${lawyer.status ? lawyer.status : 'N/A'}</td>
            <td>
                <a onclick="viewSummary('${i}')" class="btn btn-sm text-dark" data-toggle="modal" data-target="#detailsModal">View</a>
            </td>
          </tr>
        `
}



const renderQuestions = (question, count, id) => {
  let time = new moment(Math.abs(question.timestamp));
  let name = question.name || "Anonymous";
  let response = question.response || "No Response Yet";


  return `<div class="">
    <!-- Card header -->
    <div class="card-header" role="tab" id="headingOne${count}">
      <a data-toggle="collapse" data-parent="#accordionEx" href="#accordion${count}" aria-expanded="true"
        aria-controls="collapseOne1">
        <h5 class="mb-0">
          Question by ${name} <i class="fas fa-angle-down rotate-icon"></i>
          <span class="float-right"><small>${time.format('Do MMMM YYYY')}</small></span>
        </h5>
      </a>
    </div>
    <!-- Card body -->
    <div id="accordion${count}" class="collapse" role="tabpanel" aria-labelledby="headingOne${count}"
      data-parent="#accordionEx">
      <div class="card-body">
        <h5>Question: </h5>
        <p class="text-justify">
          ${question.text}
        </p><hr/>
        <h5>Advice: </h5>
        <p class="text-justify" id="answer${count}">
        ${response}
        </p>

        <div class="d-flex justify-content-end" id="actions${count}">
          <a id="edit${count}" onclick = "editResponse('${count}')" class="mx-1"><i class="far fa-edit"></i></a>
          <a id = "save${count}"style="display:none" onclick = "saveResponse('${count}', '${id}')" class="mx-1 save"><i class="fas fa-save"></i> Save changes </a>
          <a class="text-danger" onclick = "deleteResponse('${count}', '${id}')" mx-1"><i class="fas fa-trash"></i></a>
        </div>
      </div>
    </div>
  </div>`
}

const renderDocuments = (id, document) => {
  let downloads = document.download || 0
  let description = document.description.length > 45 ? document.description.substr(0, 21) + '...' : document.description
  return `
  <div class = "col-md-4 mb-4">
  <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title"><i class="fas fa-file"></i> ${document.title || "N/A"}</h5>
                      <p class="card-text text-left" data-toggle = "tooltip" title = "${document.description}">
                        ${description}
                      </p>
                      
                    
                    <hr/>
                    <div class = "d-flex flex-row justify-content-between" >
                    <h5>&#8358;${accounting.formatNumber(document.price) || "N/A"}</h5>
                    <span class="badge badge-info">${downloads}</span>
                    </div>
                    <hr/>
                    <button type="button" class="btn btn-light-blue btn-md" onclick = "replaceDocument('${id}')">Change</button>
                    <button type="button" class="btn btn-red btn-md" onclick="requestDelete('${id}')">Delete</button>
                </div>
            </div>
  </div>
  `
}


const renderPaymentNotification = (note, taskId, noteId) => {
  let time = moment(Math.abs(note.timestamp));
  return `<li class="list-group-item" onclick = "markAsRead('${taskId}', '${noteId}')">
              <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-2 h5">${note.title}</h5>
              <small>${time.fromNow()}</small>
              </div>
              <p class="mb-2">
              ${note.message}</p>
          </li>`
}
const renderMeetingNotification = (note, taskId, noteId) => {
  let time = moment(Math.abs(parseInt(note.timestamp)));
  return `<li class="list-group-item" onclick = "markAsRead('${taskId}', '${noteId}')">
      <div class="d-flex w-100 justify-content-between">
      <h5 class="mb-2 h5">${note.title}</h5>
      <small>${time.fromNow()}</small>
      </div>
      <p class="mb-2">
      ${note.message}.</p>
      <div class = "d-flex w-40">
      <button class = "btn btn-outline-default" onclick = "gotoMeetings('${note.meetingId}')"><i class="fas fa-video pr-2"></i> Join Meeting</button>
      </div>
  </li>`
}

const renderNotification = i => {
  let task = TASKS[i];
  let notifications = task.activities || []
  let typeDict = { payment: renderPaymentNotification, meeting: renderMeetingNotification };
  let noteHTML = '';
  notifications.reverse().forEach((note, noteId) => {
    noteHTML += typeDict[note.type](note, i, noteId);
  });
  console.log(noteHTML);
  $('#notificationList').html(noteHTML);
}



