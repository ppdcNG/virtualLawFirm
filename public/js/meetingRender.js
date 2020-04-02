

const renderMeetingMembers = (members, id) => {
  console.log(members);
  let context = members.length > 0 ? "Join" : 'Start';
  let membersHtml = `
    <ul width = "90" class="list-group">
          <li class="list-group-item">
          <div class = "d-flex flex-row justify-content-around">
            <div class = "d-flex flex-row justify-content-around">
              <i class="fas fa-user-friends fa-3x"></i>
              <p class = "align-self-center pl-3">There are ${members.length} members in this chat </p>
            </div>
            <button id = "startCallBttn" class = "btn default-color" onclick = "startCall2()"><i class="fas fa-phone-alt pr-2"></i> ${context} Call</button>
          </div>
          </li>
        </ul>
    `;
  $(`#${id}`).html(membersHtml);
}

const renderRemoteStream = (id) => {
  let videoHTML = `
    <div class="col z-depth-5">
            <video width = "300" height = "300"  id="stream${id}" muted autoplay playsinline></video>
    </div>
    `;
  $("#remoteStreams").append(videoHTML);
}