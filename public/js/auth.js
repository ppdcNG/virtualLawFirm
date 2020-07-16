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

var ABS_PATH = window.location.host == 'localhost:3000' ? "http://localhost:3000/" : "https://lawtrella.herokuapp.com/";
const PAYSTACK_KEY = 'pk_test_f959e563f2034dc095ddb2269123685ef1f2185e';
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
