var MEMBERS = {};

var notification = null;
var rtc = {
    client: null,
    joined: false,
    localStream: null,
    remoteStreams: [],
    published: false,
    params: {},
    screenStream: null,
}

var options = {
    appId: AGORA_APP_ID,
    channelName: $("#meetingId").val(),
    uid: $("#uid").val(),
    meetingId: $("#meetingId").val(),
    taskId: $("#taskId").val(),
    photoUrl: $("#photoUrl").val(),
    present: $("#present").val(),
    audioOn: true,
    videoOn: true,
    screenOn: false


}



$(document).ready(function () {

    getMeetingDetails();
    listenForNewMembers();
    $("#joinButton").click((e) => { joinCall() });

});



const joinCall = async () => {
    buttonLoad('joinButton');
    let mydata = { name: $("#username").val(), uid: options.uid, photoUrl: options.photoUrl };
    let memberData = firebase.firestore.FieldValue.arrayUnion(mydata)
    let meetingPath = `meetingSchedules/${options.taskId}/meetings/${options.meetingId}`;
    let docRef = firebase.firestore().doc(meetingPath);
    if (!options.present) {
        await docRef.update({ activeMembers: memberData });
    }
    rtc.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'h264' });
    notification = $.notify("Initializing Client ....", { type: 'info', delay: 0 })
    rtc.client.init(options.appId, function () {
        console.log('Client Initialiazation successfull');
        notification.update('message', "Joining Call");
        rtc.client.join(null, options.channelName, options.uid, onJoinSuccess, handleError);
    }, handleError);

    registerEventHandlers();
}


const onJoinSuccess = uid => {
    console.log("Successfully Joined channel " + options.channelName + " as " + options.uid);
    notification.update('message', "Successfully joined the channel");
    notification.update('message', 'Setting Up your video');
    setTimeout(() => {
        notification.close();
    }, 800);
    rtc.localStream = AgoraRTC.createStream({
        streamID: uid,
        video: true,
        audio: true,
        screen: false
    });

    rtc.localStream.init(() => {
        rtc.localStream.play('localVideo');
        rtc.client.publish(rtc.localStream, (err) => { console.log('error adding localstream', err) });
        $("#meetingDetails").fadeOut();
    }, (err) => { console.log('errorPlaying Stream', err) });

}

const handleError = e => console.log(e);


const registerEventHandlers = () => {
    rtc.client.on("stream-added", function (evt) {
        let remoteStream = evt.stream;
        let id = remoteStream.getId();
        rtc.remoteStreams.push(remoteStream);
        if (id !== options.uid) {
            let name = MEMBERS[id].name;
            console.log('remoteStream Added', id)
            rtc.client.subscribe(remoteStream, (err) => { console.log('Remote Stream Subscription failed', err) });
        }
    });


    rtc.client.on('stream-subscribed', function (evt) {
        console.log('playing Remote Stream')
        let remoteStream = evt.stream;
        let id = remoteStream.getId();
        let name = MEMBERS[id].name;
        notification = $.notify(`${name} Joining the call...`, { type: "success", delay: 1000 });
        renderRemoteVideo(id);
        let ele = "remote-" + id;
        remoteStream.play(ele);
    });

    rtc.client.on('mute-video', handleVideoMute);
    rtc.client.on('unmute-video', handleVideoUnmute);
    rtc.client.on('mute-audio', handleAudioMute);
    rtc.client.on('unmute-audio', handleAudioUnmute)
}

const handleVideoMute = evt => {
    let id = evt.uid;
    if (id != options.uid) {
        $(`#remote-${id}`).hide();
        $(`#avartar-${id}`).fadeIn(900);
        renderRemoteVideoToggle(false, id);
    }

}
const handleVideoUnmute = evt => {

    let id = evt.uid;
    if (id != options.uid) {
        $(`#remote-${id}`).fadeIn();
        $(`#avartar-${id}`).hide(900);
        renderRemoteVideoToggle(true, id);
    }

}
const handleAudioMute = evt => {
    let id = evt.uid;
    if (id != options.uid) {
        renderRemoteAudio(false, id);
    }
}
const handleAudioUnmute = evt => {

    let id = evt.uid;
    if (id != options.uid) {
        renderRemoteAudio(true, id);
    }
}

const addRemoteStrem = id => {
    console.log('adding Stream')


}


const getMeetingDetails = async () => {
    let meetingPath = `meetingSchedules/${options.taskId}/meetings/${options.meetingId}`;
    console.log(meetingPath);
    $("#loadingOverlay").show().addClass("d-flex")

    let meetingSchedule = await firebase.firestore().doc(meetingPath).get();
    let meeting = meetingSchedule.data();
    let start = moment(Math.abs(parseInt(meeting.start))).format('hh:mm a');
    let end = moment(Math.abs(parseInt(meeting.end))).format('hh:mm a');
    let time = moment(Math.abs(parseInt(meeting.timestamp))).format('ddd, Do MMM YYYY');

    let timeText = `Start Time : <b>${start}</b> and Ends At : <b>${end}</b>`;
    let memberCount = meeting.activeMembers ? meeting.activeMembers.length : 0;
    let membersList = "";
    if (meeting.activeMembers) {
        meeting.activeMembers.forEach((member, i) => {
            MEMBERS[member.uid] = member.name;
            membersList += member.name + " ";
        })
    };

    $("#meetingDate").text(time);
    $("#meetingTime").html(timeText);
    $("#memberNumber").text(memberCount);
    $("#meetingMembers").text(membersList);

    $("#loadingOverlay").removeClass('d-flex').fadeOut();
    // $("#loadingOverlay").toggle();


}

const listenForNewMembers = () => {
    let meetingPath = `meetingSchedules/${options.taskId}/meetings/${options.meetingId}`;
    firebase.firestore().doc(meetingPath).onSnapshot(function (snapshot) {
        console.log('Detected New member');
        let meeting = snapshot.data();
        let members = meeting.activeMembers;
        members.forEach((member) => {
            MEMBERS[member.uid] = member;
        })
    })
}

const renderRemoteVideo = (id) => {
    let name = MEMBERS[id].name;
    let photoUrl = MEMBERS[id].photoUrl;
    let vid = `
    <div class="card col-sm-4 p-3">
          <div class = "card-header">${name}</div>
          <div id="remote-${id}" class = "align-self-center p-2" style = "width: 400; height:300">
          
          </div>
          <div id = "avartar-${id}" class = "align-self-center p-2 m-3" style = "display:none">
            <img src="${photoUrl}" style="width:100;height:100" class="rounded-circle mx-auto d-block" alt="profile_pic">
          </div>
          <div class=" align-self-center w-45 d-flex justify-content-around">
            <a class="btn-floating btn-lg btn-outline-danger mx-3 meeting-button" data-toggle = "tooltip" title = "Toggle Screen Sharing" data-tg onclick = "toggleScreen()" id = "shareScreenButton${id}"><i class="fas fa-desktop"></i></a>
            <a class="btn-floating btn-lg btn-outline-elegant mx-3 meeting-button" data-toggle = "tooltip" title = "Toggle Microphone" onclick = "toggleAudio()" id = "audioButton${id}"><i class="fas fa-microphone-slash"></i></a>
            <a class="btn-floating btn-lg btn-outline-elegant mx-3 meeting-button" data-toggle = "tooltip" title = "Toggle Video" onclick = "toggleVideo()" id = "videoButton${id}"><i class="fas fa-video"></i></a>
            <a class="btn-floating btn-lg btn-outline-danger mx-3 meeting-button" data-toggle = "tooltip" title = "Toggle " onclick = "hangup()" id = "hangupButton${id}"><i class="fas fa-phone-slash"></i></a>
          </div>
    </div>
    `
    let sr = $(`#remote-${id}`)[0];
    console.log('remote srrrrrrr', sr);
    sr || $("#remoteStreams").append(vid);
}

const hangup = () => {
    notification = $.notify('Leaving Call', { type: 'warning', delay: 1500 });
    rtc.client.leave(() => {
        $.notify("Disconnected from channel")
    });

}

const toggleAudio = () => {
    if (options.audioOn) {
        rtc.localStream.muteAudio();
        $.notify('Audio Muted', { type: 'danger', delay: 1500 });
        options.audioOn = false
        renderAudioToggle();
        return
    }

    rtc.localStream.unmuteAudio();
    $.notify('Audio Un-Muted', { type: 'success', delay: 1500 });
    options.audioOn = true;
    renderAudioToggle();



}

const toggleVideo = () => {
    if (options.videoOn) {
        rtc.localStream.muteVideo();
        $('#localVideo').hide();
        $("#avartar").fadeIn();
        $.notify('Video is Of', { type: 'danger', delay: 1500 });
        options.videoOn = false
        renderVideoToggle();
        return
    }
    else {
        rtc.localStream.unmuteVideo();
        $('#localVideo').fadeIn();
        $("#avartar").hide();
        $.notify('Video is On', { type: 'success', delay: 1500 });
        options.videoOn = true;
        renderVideoToggle();
    }
}
const toggleScreen = () => {
    if (options.screenOn) {
        rtc.client.unpublish(rtc.screenStream, (err) => { console.log(err) });
        rtc.client.publish(rtc.localStream, err => console.log(err));
        options.screenOn = false;
        return
    }
    options.screenOn = true
    rtc.screenStream = AgoraRTC.createStream({
        streamID: options.uid,
        video: false,
        audio: false,
        screen: true
    });
    rtc.client.unpublish(rtc.localStream, (err) => { console.log(err) });
    rtc.screenStream.init(() => {
        rtc.screenStream.play('localVideo');
        rtc.client.publish(rtc.screenStream, (err) => { console.log('error adding Screen Stream', err) });
    }, (err) => { console.log('errorPlaying Stream', err) });



}

const renderAudioToggle = () => {
    let Button = $("#audioButton");
    if (options.audioOn) {
        Button.html(`<i class="fas fa-microphone"></i>`);
        Button.removeClass('btn-danger');
        Button.addClass('btn-outline-elegant');
        return
    }
    Button.html(`<i class="fas fa-microphone-slash"></i>`);
    Button.removeClass('btn-outline-elegant');
    Button.addClass('btn-danger');
}

const renderVideoToggle = () => {
    let VideoButton = $("#videoButton");
    if (options.videoOn) {
        VideoButton.html(`<i class="fas fa-video"></i>`);
        VideoButton.removeClass('btn-danger');
        VideoButton.addClass('btn-outline-elegant');
        return
    }
    VideoButton.html(`<i class="fas fa-video-slash"></i>`);
    VideoButton.removeClass('btn-outline-elegant');
    VideoButton.addClass('btn-danger');
}

const renderRemoteVideoToggle = (on, id) => {
    let VideoButton = $(`#videoButton${id}`);
    if (on) {
        VideoButton.html(`<i class="fas fa-video"></i>`);
        VideoButton.removeClass('btn-danger');
        VideoButton.addClass('btn-outline-elegant');
        return
    }
    VideoButton.html(`<i class="fas fa-video-slash"></i>`);
    VideoButton.removeClass('btn-outline-elegant');
    VideoButton.addClass('btn-danger');
}

const renderRemoteAudio = (on, id) => {
    let AudioButton = $(`#audioButton${id}`);
    if (on) {
        AudioButton.html(`<i class="fas fa-microphone"></i>`);
        AudioButton.removeClass('btn-danger');
        AudioButton.addClass('btn-outline-elegant');
        return
    }
    AudioButton.html(`<i class="fas fa-microphone-slash"></i>`);
    AudioButton.removeClass('btn-outline-elegant');
    AudioButton.addClass('btn-danger');
}





