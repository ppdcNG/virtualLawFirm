


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

}


rtc.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'h264' });

rtc.client.init(options.appId, function () {
    console.log('Client Initialiazation successfull');
    rtc.client.join(null, options.channelName, options.uid, function (uid) {
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
        }, (err) => { console.log('errorPlaying Stream', err) });



    }, (e) => { console.log('JoinFailed', e) });
}, (e) => { console.log('error', e) });

rtc.client.on("stream-added", function (evt) {
    let remoteStream = evt.stream;
    let id = remoteStream.getId();
    rtc.remoteStreams.push(remoteStream);
    if (id !== options.uid) {
        console.log('remoteStream Added', id)
        rtc.client.subscribe(remoteStream, (err) => { console.log('Remote Stream Subscription failed', err) });
    }
});


rtc.client.on('stream-subscribed', function (evt) {
    console.log('playing Remote Stream')
    let remoteStream = evt.stream;
    remoteStream.play('remoteVideo');
})





