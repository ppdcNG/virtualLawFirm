var MEMBERS = {};



var rtc = {
    client: null,
    joined: false,
    localStream: null,
    remoteStreams: [],
    published: false,
    params: {}
}

var options = {
    appId: AGORA_APP_ID,
    channelName: $("#meetingId").val(),
    uid: $("#uid").val(),
    meetingId: $("#meetingId").val(),
    taskId: $("#taskId").val()

}



$(document).ready(function () {
    getMeetingDetails();

    $("#joinButton").click((e) => { joinCall() });

});



const joinCall = async () => {
    let mydata = { name: $("#username").val(), uid: options.uid };
    let memberData = firebase.firestore.FieldValue.arrayUnion(mydata)
    let meetingPath = `meetingSchedules/${options.taskId}/meetings/${options.meetingId}`;
    let docRef = firebase.firestore().doc(meetingPath);
    await docRef.update({ activeMembers: memberData });

    rtc.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'h264' });
    rtc.client.init(options.appId, function () {
        console.log('Client Initialiazation successfull');
        rtc.client.join(null, options.channelName, options.uid, onJoinSuccess, handleError);
    }, handleError);

    registerEventHandlers();
}


const onJoinSuccess = uid => {
    console.log("Successfully Joined channel " + options.channelName + " as " + options.uid);

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
            renderRemoteVideo(id);
            console.log('remoteStream Added', id)
            rtc.client.subscribe(remoteStream, (err) => { console.log('Remote Stream Subscription failed', err) });
        }
    });


    rtc.client.on('stream-subscribed', function (evt) {
        console.log('playing Remote Stream')
        let remoteStream = evt.stream;
        let ele = "remoteVideo" + remoteStream.getId()
        remoteStream.play(ele);
    });
}

const addRemoteStrem = id => {
    console.log('adding Stream')


}


const getMeetingDetails = async () => {
    let meetingPath = `meetingSchedules/${options.taskId}/meetings/${options.meetingId}`;
    console.log(meetingPath);
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


}

const listenForNewMembers = () => {
    let meetingPath = `meetingSchedules/${options.taskId}/meetings/${options.meetingId}/activeMembers`;
    firebase.firestore().doc(meetingPath).on('value', function (snapshot) {
        console.log('Detected New member');
        let members = snapshot.data();
        members.forEach((member) => {
            MEMBERS[member.uid] = member.name;
        })
    })
}

const renderRemoteVideo = (id) => {
    let name = MEMBERS[id];
    let vid = `
    <div>
      <div id = "remoteVideo${id}" style = "width: 300; height: 300"></div>
      <p>${name}</p>
    </div>
    `
    $("#remoteStreams").append(vid);
}





