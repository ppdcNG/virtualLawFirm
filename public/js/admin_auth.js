


const signIn = async (email, password)=>{
   let user = await firebase.auth().signInWithAndPassword(email, password);
   let idToken = await user.getIdToken();
   console.log(idToken);
   let url = ABS_PATH + 'admin/auth';
   ajaxrequest("", idToken,url, (response)=>{
      
   });

}