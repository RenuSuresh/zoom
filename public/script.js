const videGrid = document.getElementById("video-grid")
const myVideo = document.createElement('video');
const socket = io("/")
myVideo.muted = true;

var peer = new Peer(undefined, {
  path: '/peerjs',
  host: "/",
  port: '443' // change this to 443 when deploying on local 3030
})

let myVideoStream;
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream)
  peer.on("call", call => {
    call.answer(stream);
    const video = document.createElement("video");
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', (userId) => {
    connectToNewUser(userId, stream)
  })


  const msg = $('input');

  $('html').keydown((e) => {
    if (e.which === 13 && msg.val().length != 0) {
      socket.emit('message', msg.val());
      msg.val('');
    }
  })

  socket.on('createMessage', (message) => {
    console.log("message from server>>>>>>>", message);
    $('ul').append(`<li class="message"> <b>user</b></br> ${message}</li>`)
    scrollBottom()
  })
})

const connectToNewUser = (userId, stream) => {
  console.log("new user", userId)
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
}

peer.on("open", id => {
  socket.emit("join-room", ROOM_ID, id);
})


const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videGrid.appendChild(video)
}


const scrollBottom = () => {
  let d = $('.main__chat__window');
  d.scrollTop(d.prop("scrollHeight"))
}

const setUnMuteButton = () => {
  const html = `<i class="fas fa-microphone"></i> <span>UnMute</span>`;
  document.querySelector('.main__mute_button').innerHTML = html;
}
const setMuteButton = () => {
  const html = `<i class="fas fa-microphone-slash"></i><span>Mute</span>`;
  document.querySelector('.main__mute_button').innerHTML = html;
}
// mute function
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnMuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const setPlayButton = () => {
  const html = `<i class="fas fa-play"></i><span>Play</span>`;
  document.querySelector('.main__video_button').innerHTML = html;
}

const setStopButton = () => {
  const html = `<i class="fas fa-stop"></i><span>Stop</span>`;
  document.querySelector('.main__video_button').innerHTML = html;
}

// stop video
const playStopVideo = () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayButton();
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    setStopButton();
  }
}
