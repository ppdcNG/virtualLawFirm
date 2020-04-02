

var meetingId = null;
var authId = $("#uid").val();
var members = null;
var localStream = null;
var myConnectionId = null;
var connectionIds = [];
var meetingRef = null;
var memberIndex = null;
videoSenders = {};
audioSenders = {};
var rmtStreams = {};

$(document).ready(async (e) => {
    meetingId = $("#meetingId").val();
    myConnectionId = $("#uid").val();
    meetingRef = firebase.firestore().collection('videoChats').doc(meetingId);
    await checkMeeting();
})

const checkMeeting = async () => {

    let meetingSnapshot = await meetingRef.get().catch((e) => { console.log(e) });
    let meetingData = meetingSnapshot.data();
    members = meetingData.attendees ? meetingData.attendees : [];
    renderMeetingMembers(members, 'members');
}


const startCall = async () => {
    $("#startCallBttn").toggleClass('disabled');
    let notification = $.notify("Please Wait.. while we connect you...", { type: 'info', delay: 0 });
    if (members.length == 0) {
        localStream = await openCam('localVideo');
        let remoteStream = new MediaStream();
        remoteStreams.push(remoteStream);
        $("#remote1")[0].srcObject = remoteStream;
        myConnectionId = '' + Math.floor((Math.random() * 1000000000) + 1);
        console.log(myConnectionId);
        let connectionRef = await meetingRef.collection(myConnectionId).doc();
        let senders = await createFirstOffer(connectionRef, localStream);
        videoSenders[myConnectionId] = senders.videoSender;
        audioSenders[myConnectionId] = senders.audioSender;
        let conProps = {
            userCollection: myConnectionId,
            userDoc: connectionRef.id
        }
        console.log(videoSenders);
        let meetingObject = {
            startTime: 0 - new Date().getTime(),
            attendees: firebase.firestore.FieldValue.arrayUnion(conProps)
        }
        await meetingRef.update(meetingObject);
        notification.update('title', "Offer has been created at " + myConnectionId);
        toggleChatRoomView();
        notification.close();
    }
    if (members.length == 1) {
        console.log('one member already in the room joining');
        localStream = await openCam('localVideo');
        let remoteStream = new MediaStream();
        remoteStreams.push(remoteStream);
        myConnectionId = '' + Math.floor((Math.random() * 1000000000) + 1);
        peerConnectionId = members[0];
        // let videoObj = addRemoteStream(peerConnectionId.userDoc);
        // remoteStreams.push(remoteStream);
        console.log(remoteStream);
        $("#remote1")[0].srcObject = remoteStream;
        console.log(peerConnectionId);
        let connectionRef = await meetingRef.collection(peerConnectionId.userCollection).doc(peerConnectionId.userDoc);
        console.log(connectionRef.id, connectionRef);
        let senders = await answerFirstOffer(connectionRef, localStream);
        videoSenders[myConnectionId] = senders.videoSender;
        audioSenders[myConnectionId] = senders.audioSender;
        let conProps = {
            userCollection: myConnectionId,
            userDoc: connectionRef.id
        }
        let meetingObject = {
            attendees: firebase.firestore.FieldValue.arrayUnion(conProps)
        }
        //set my collection
        meetingRef.collection(myConnectionId).add({ join: peerConnectionId.userCollection })
        await meetingRef.update(meetingObject);
        notification.update('title', "Answer has been created at " + myConnectionId);
        toggleChatRoomView();
        notification.close();
    }
}

const startCall2 = async () => {
    if (members.length > 0) {
        await joinMultiple();
    }
    else {
        await waitForCallers();
    }
    toggleChatRoomView();
}


const initiateCall = async (userCollectionId, localStream) => {

    let remoteStream = new MediaStream();
    remoteStreams[userCollectionId] = remoteStream;
    let remoteElement = $(`#stream${userCollectionId}`)[0] || addRemoteStream(userCollectionId);
    remoteElement.srcObject = remoteStream;
    connectionId = userCollectionId || '' + Math.floor((Math.random() * 1000000000) + 1);
    console.log(connectionId);
    let connectionRef = await meetingRef.collection(connectionId).doc(myConnectionId);
    let senders = await createFirstOffer(connectionRef, localStream, connectionId);
    videoSenders[connectionId] = senders.videoSender;
    audioSenders[connectionId] = senders.audioSender;
    connections[connectionId] = senders.peerConnection;

    console.log('title', "Offer has been created at " + userCollectionId);
}

const answerCall = async (docId, localStream) => {
    let remoteStream = new MediaStream();
    remoteStreams[docId] = remoteStream;
    let remoteElement = $(`#stream${docId}`)[0] || addRemoteStream(docId);
    remoteElement.srcObject = remoteStream;
    let connectionRef = await meetingRef.collection(myConnectionId).doc(docId);

    let senders = await answerFirstOffer(connectionRef, localStream, docId);
    videoSenders[docId] = senders.videoSender;
    audioSenders[docId] = senders.audioSender;
    connections[docId] = senders.peerConnection;

}

const registerAttendance = async userid => {
    let conProps = {
        userCollection: userid,
        connectionTime: 0 - new Date().getTime(),

    }
    let meetingObject = {
        attendees: firebase.firestore.FieldValue.arrayUnion(conProps)
    }
    await meetingRef.update(meetingObject);
}

const joinMultiple = async () => {
    await createMyBucket();
    await callMembers();
    await registerAttendance(myConnectionId);
}

const waitForCallers = async () => {
    await createMyBucket();
    await registerAttendance(myConnectionId);
}

const createMyBucket = async () => {
    localStream = await openCam('localVideo');
    meetingRef.collection(myConnectionId).doc().set({ initial: myConnectionId });
    meetingRef.collection(myConnectionId).onSnapshot((snapshot) => {
        console.log('someone is calling Me.. Lemme Answer')
        snapshot.docChanges().forEach(async change => {
            let data = change.doc.data();
            if (change.type == "added" && data.offer) {
                await answerCall(change.doc.id, localStream);
            }
        })
    });
}

const callMembers = async () => {
    members.forEach(async (member) => {
        await initiateCall(member.userCollection, localStream);
    });
}


const toggleChatRoomView = () => {
    $("#membersSection").toggle();
    $("#videoSection").toggle();
}



const addRemoteStream = (id) => {
    renderRemoteStream(id);
    return $(`#stream${id}`)[0];

}



