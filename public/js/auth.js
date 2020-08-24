var firebaseConfig = {
  apiKey: "AIzaSyCunw8Lsb3gUYG_TQNHLf12PaWHuvfuL2M",
  authDomain: "virtuallawfirm-2478e.firebaseapp.com",
  databaseURL: "https://virtuallawfirm-2478e.firebaseio.com",
  projectId: "virtuallawfirm-2478e",
  storageBucket: "virtuallawfirm-2478e.appspot.com",
  messagingSenderId: "838064767859",
  appId: "1:838064767859:web:d1e8af8a574f6b42243b06",
  measurementId: "G-6P45Y1WFK3"
};
var firebaseProdConfig = {
  apiKey: "AIzaSyBNaUoqktjH9fjsEjXzZjdabOARH0bxpPg",
  authDomain: "lawtrella-prod.firebaseapp.com",
  databaseURL: "https://lawtrella-prod.firebaseio.com",
  projectId: "lawtrella-prod",
  storageBucket: "lawtrella-prod.appspot.com",
  messagingSenderId: "247425002683",
  appId: "1:247425002683:web:a61cefbeb8a617bd1d4d9e",
  measurementId: "G-KWZGWK6QN7"
};
// Initialize Firebase

var config = window.location.host == 'localhost:3000' ? firebaseConfig : firebaseProdConfig;
firebase.initializeApp(config);
firebase.analytics();

var ABS_PATH = window.location.host == 'localhost:3000' ? "http://localhost:3000/" : "https://www.lawtrella.com/";
const PAYSTACK_KEY = window.location.host == 'localhost:3000' ? "pk_test_90906c497a5030ec77dddecb2abb511ff903977b" : 'pk_live_f79f20c649e6cc5cfcd5abc2ad4cf250f66682ce';
const AGORA_APP_ID = '15d92311708b4cfcafe40828bcb9fe3a';
function ajaxrequest(modal, json_data, to_url, call_back) {
  var dataObject = { data: json_data }
  $.ajax({
    type: "post",
    data: dataObject,
    url: to_url,
    content: "application/json",
    success: call_back,
    complete: function () { },
    beforSend: function () { }
  });


}

const is_empty = (object) => { return !Object.keys(object).length > 0 }

const image_placeholder = 'https://i1.wp.com/www.essexyachtclub.co.uk/wp-content/uploads/2019/03/person-placeholder-portrait.png?fit=500%2C500&ssl=1';

function loadBtn(id) {
  $('#' + id).click(function () {
    $('#' + id).html('<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Loading...').addClass('disabled');
  });
}

function buttonLoad(id) {
  $('#' + id).html('<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Loading...').addClass('disabled');
}
const buttonLoadSpinner = id => {
  $("#" + id).html('<i class="fas fa-spinner fa-pulse"></i>').addClass('disabled')
}

function clearLoad(id, text) {
  $('#' + id).html('<span>' + text + '</span >').removeClass('disabled');
}


const Spinner = () => {
  return `
  <div class="spinner-grow slow align-self-center" role="status" id="loadingTasks"><span class="sr-only">Loading...</span></div>
  `
}

const truncate = (string, length) => {
  if (string.length < length) {
    return string;
  }
  let sub = string.substr(0, length);
  return sub + "...";
}
let lastActive = null;
window.onblur = () => {
  lastActive = new Date().getTime();
  console.log(lastActive);
}
window.onfocus = () => {
  if (lastActive) {
    let now = new Date().getTime();
    let different = now - lastActive;
    let twohours = 60 * 60 * 2 * 1000;
    console.log(different)
    if (different > twohours && $("#uid").val()) {
      window.location = ABS_PATH + 'logout';
    }
  }
}