
$('#adminLogin').submit(function (e) {
   e.preventDefault();
   let form = form2js('adminLogin', ".");

   let { email, password } = form;

   signIn(email, password);
})
var uservar;
const signIn = async (email, password) => {
   let res = await firebase.auth().signInWithEmailAndPassword(email, password)

   let idToken = await res.user.getIdToken();

   let req = {idToken} ;

   console.log(idToken);
   let url = ABS_PATH + 'admin/auth';
   $.ajax({
      url: url,
      data: req,
      type: 'POST',
      success: function (response) {
         console.log(response)
         if(response.status == 'success'){
            window.location = ABS_PATH + 'admin';
         }
      },
      error: e => console.log(e)

   })
}

$('#newUser').submit((e) => {
   e.preventDefault();
   var form = form2js('newUser', ".");

   $.ajax({
      url: ABS_PATH + 'admin/createUser',
      data: form,
      type: 'POST',
      success: function (response) {
         console.log(response)
         if (!response.err) {
            $.notify('User created successfully', { type: 'success' })
         }
         else {
            $.notify(response.err.message, { type: 'warning' });
         }

      },
      error: e => console.log(e)
   })
})