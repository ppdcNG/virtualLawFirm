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
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();


var ABS_PATH = "http://localhost:3000/";

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

function loadBtn(id) {
  $('#' + id).click(function () {
    $('#' + id).html('<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Loading...').addClass('disabled');
  });
}

function clearLoad(id, text) {
  $('#' + id).html('<span>' + text + '</span >').removeClass('disabled');
}
