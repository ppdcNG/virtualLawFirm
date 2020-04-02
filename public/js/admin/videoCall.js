
var localStream = null;
var remoteStream = null;

var audioTrack = null;
var videoTrack = null;
var screenTrack = null;
var videoSender = null;
var audioSender = null;
var peerConnection = null;
var localSender = null;
const configuration = {
    iceServers: [
        {
            urls: [
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
            ],
        },
    ],
    iceCandidatePoolSize: 10,
};




const openCam = async () => {
    console.log("opening Cam")
    const mediaConstraint = {
        video: true,
        audio: true
    }
    let stream = await navigator.mediaDevices.getUserMedia(mediaConstraint).catch((e) => { console.log(e) });
    console.log(stream);
    document.querySelector("#localVideo").srcObject = stream;
    localStream = stream;
    remoteStream = new MediaStream();
    document.querySelector("#remoteVideo").srcObject = remoteStream;

}

const shareScreen = async () => {
    console.log("sharing screen");
    const screenConstraints = {
        video: {
            cursor: 'always' | 'motion' | 'never',
            displaySurface: 'application' | 'browser' | 'monitor' | 'window'
        }
    }
    let stream = await navigator.mediaDevices.getDisplayMedia(screenConstraints).catch((e) => { console.log(e) });

    screenTrack = stream.getVideoTracks()[0];
    videoSender.replaceTrack(screenTrack);

}

const createRoom = async () => {
    console.log('creating room');
    peerConnection = new RTCPeerConnection(configuration);
    const roomRef = await firebase.firestore().collection('rooms').doc();
    registerPeerConnectionListeners();
    //Add LocalStream tracks to peerconnection
    videoTrack = localStream.getVideoTracks()[0];
    audioTrack = localStream.getAudioTracks()[0];
    videoSender = peerConnection.addTrack(videoTrack, localStream);
    audioSender = peerConnection.addTrack(audioTrack, localStream);

    /// Collect Ice Candidtates
    const callerCandidatesCollection = roomRef.collection('callerCandidates');
    peerConnection.addEventListener('icecandidate', (event) => {
        if (!event.candidate) {
            console.log('No Candidate Yet');
            return
        }
        console.log('Ice Candidate gotten', event.candidate);
        callerCandidatesCollection.add(event.candidate.toJSON()).catch((e) => { console.log(e) });
    });

    //Create Room With Offer
    offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    const roomWithOffer = {
        offer: {
            type: offer.type,
            sdp: offer.sdp
        }
    }
    await roomRef.set(roomWithOffer).catch((e) => { console.log(e) });
    $("#roomId").text(`Your room Id is ${roomRef.id}`);

    ///Listen For Remote Track
    peerConnection.addEventListener('track', event => {
        console.log('Got remote Track', event.streams[0]);
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
        })
    });

    /// Listen For Remote SDP
    roomRef.onSnapshot(async (snapshot) => {
        console.log('answer Received');
        let room = snapshot.data();
        if (!peerConnection.currentRemoteDescription && room.answer) {
            let descriptor = new RTCSessionDescription(room.answer);
            await peerConnection.setRemoteDescription(descriptor);
        }

    });


    ///Listen For ICE Candedates
    const calleeCandidatesCollection = roomRef.collection('calleeCandidates');
    calleeCandidatesCollection.onSnapshot((snapshot) => {
        snapshot.docChanges(async (change) => {
            if (change.type === 'added') {
                let data = change.doc.data();
                console.log('callee candidate Detected', JSON.stringify(data));
                await peerConnection.addIceCandidate(new RTCIceCandidate(data));
            }
        })
    })

}

const joinRoom = async () => {
    let roomId = $("#joinId").val();
    if (!roomId) {
        console.log('No Room Id Provided');
        return;
    }
    $("#roomId").text(`joining room with id of ${roomId}`);
    let roomRef = firebase.firestore().collection('rooms').doc(roomId)
    let snapshot = await roomRef.get();
    if (snapshot.exists) {
        $("#roomId").text("Creating Peer connection");
        peerConnection = new RTCPeerConnection(configuration);
        registerPeerConnectionListeners();

        // Add Local Stream Tracks to peerconnection Tracks
        localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStream);
        });
        //Collecting ICE Candidates
        const calleeCandidatesCollection = roomRef.collection('calleeCandidates');
        peerConnection.addEventListener('icecandidate', (event) => {
            if (!event.candidate) {
                console.log('Got Final Candidate');
                return
            }
            console.log("Candidate Gotten")
            calleeCandidatesCollection.add(event.candidate.toJSON());
        });

        //Listen for Remote Stream Tracks from peer connection
        peerConnection.addEventListener('track', event => {
            console.log('Remote Track Added', event.streams[0]);
            console.log(event.streams);
            event.streams[0].getTracks().forEach(track => {
                remoteStream.addTrack(track);
            });
        })

        let roomdata = snapshot.data();
        await peerConnection.setRemoteDescription(new RTCSessionDescription(roomdata.offer));
        let answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        let roomAnswer = {
            answer: {
                type: answer.type,
                sdp: answer.sdp
            }
        }
        await roomRef.update(roomAnswer);

        ///Listen For Remote Candidates
        roomRef.collection('callerCandidates').onSnapshot(async (snapshot) => {
            snapshot.docChanges().forEach(async change => {
                if (change.type == "added") {
                    let data = change.doc.data();
                    console.log('Got Remote Canditate', JSON.stringify(data));
                    await peerConnection.addIceCandidate(new RTCIceCandidate(data));
                }
            })

        })
    }


}


function registerPeerConnectionListeners() {
    peerConnection.addEventListener('icegatheringstatechange', () => {
        console.log(
            `ICE gathering state changed: ${peerConnection.iceGatheringState}`);
    });

    peerConnection.addEventListener('connectionstatechange', () => {
        console.log(`Connection state change: ${peerConnection.connectionState}`);
    });

    peerConnection.addEventListener('signalingstatechange', () => {
        console.log(`Signaling state change: ${peerConnection.signalingState}`);
    });

    peerConnection.addEventListener('iceconnectionstatechange ', () => {
        console.log(
            `ICE connection state change: ${peerConnection.iceConnectionState}`);
    });
}

const hangUp = async () => {
    let roomId = $("#roomId").text();
    await firebase.firestore().collection('rooms').doc(roomId).delete();
    peerConnection.close();

}