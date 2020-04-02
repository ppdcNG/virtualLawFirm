

var videoSenders = {};
var audioSenders = {};
var localStreams = [];
var remoteStreams = {};
var connections = {};

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


const collectICECandidates = (peerConnection, connectionRef, data) => {
    peerConnection.addEventListener('icecandidate', (event) => {
        if (!event.candidate) {
            console.log(`got final candiate for a peercandiate`);
            return
        }
        connectionRef.collection(data.role).add(event.candidate.toJSON());
    })
}
const listenForIceCanditate = (peerConnection, connectionRef, data) => {
    connectionRef.collection(data.role).onSnapshot(async (snapshot) => {
        snapshot.docChanges().forEach(async change => {
            if (change.type == "added") {
                let data = change.doc.data();
                console.log('Got Remote Canditate', JSON.stringify(data));
                await peerConnection.addIceCandidate(new RTCIceCandidate(data));
            }
        })

    })
}

const createOffer = async (peerConnection, connectionRef) => {
    offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    const roomWithOffer = {
        offer: {
            type: offer.type,
            sdp: offer.sdp
        }
    }
    await connectionRef.set(roomWithOffer).catch((e) => { console.log(e) });
}

const listenForAnswer = (peerConnection, connectionRef) => {
    connectionRef.onSnapshot(async (snapshot) => {
        let room = snapshot.data();
        if (!peerConnection.currentRemoteDescription && room.answer) {
            let descriptor = new RTCSessionDescription(room.answer);
            await peerConnection.setRemoteDescription(descriptor);
        }

    });
}


const answer = async (peerConnection, connectionRef) => {
    let snapshot = await connectionRef.get();
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
    await connectionRef.update(roomAnswer);

}

const remoteTrack = (peerConnection, stream) => {
    peerConnection.addEventListener('track', event => {
        console.log('Got remote Track', event.streams[0]);
        event.streams[0].getTracks().forEach((track) => {
            stream.addTrack(track, stream);
        })
    });
}

localTrack = (peerConnection, stream) => {

}
// creates an sdp offer listen for ice candidates and responses returns audio and video senders for this connections
const createFirstOffer = async (connectionRef, stream, remoteId = 0) => {
    let peerConnection = new RTCPeerConnection(configuration);
    registerPeerConnectionListeners(peerConnection);
    let audioSender = peerConnection.addTrack(stream.getAudioTracks()[0], stream);
    let videoSender = peerConnection.addTrack(stream.getVideoTracks()[0], stream);
    collectICECandidates(peerConnection, connectionRef, { role: 'caller' });
    remoteTrack(peerConnection, remoteStreams[remoteId]);
    await createOffer(peerConnection, connectionRef);
    listenForAnswer(peerConnection, connectionRef);
    listenForIceCanditate(peerConnection, connectionRef, { role: 'callee' });

    return { audioSender, videoSender, peerConnection }
}

const answerFirstOffer = async (connectionRef, stream, remoteId = 0) => {
    let peerConnection = new RTCPeerConnection(configuration);
    registerPeerConnectionListeners(peerConnection);
    let audioSender = peerConnection.addTrack(stream.getAudioTracks()[0], stream);
    let videoSender = peerConnection.addTrack(stream.getVideoTracks()[0], stream);
    collectICECandidates(peerConnection, connectionRef, { role: 'callee' });
    remoteTrack(peerConnection, remoteStreams[remoteId]);
    await answer(peerConnection, connectionRef);
    listenForIceCanditate(peerConnection, connectionRef, { role: 'caller' });
    return { audioSender, videoSender, peerConnection }

}

const openCam = async (localVideo) => {
    console.log("opening Cam")
    const mediaConstraint = {
        video: true,
        audio: true
    }
    let stream = await navigator.mediaDevices.getUserMedia(mediaConstraint).catch((e) => { console.log(e) });
    console.log(stream);
    document.querySelector(`#${localVideo}`).srcObject = stream;
    return stream;

}
function registerPeerConnectionListeners(peerConnection) {


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

