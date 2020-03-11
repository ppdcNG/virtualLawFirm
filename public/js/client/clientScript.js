$("#clientConfirm").submit(function (e) {
    e.preventDefault();
    let formdata = new FormData(document.getElementById('clientConfirm'));
    var form = form2js("clientConfirm", ".");
    if (form.password !== form.confirmPassword) {
        $.notify("Passwords must match", { type: "warning" });
        clearLoad('continue', 'Continue');

        return false;
    }

    $(this)[0].reset();
    buttonLoad('continue');
    $.ajax({
        url: ABS_PATH + "admin/verifyUserEmail",
        data: formdata,
        type: "POST",
        contentType: false,
        processData: false,
        success: function (response) {
            console.log(response);
            if (!response.err) {
                $.notify(response.message, { type: "success" });
                setTimeout(function () { window.location = ABS_PATH }, 2000);
            } else {
                $.notify(response.message, { type: "warning" });
                clearLoad('continue', 'Continue');
            }
        },
        error: e => {
            console.log(e);
            clearLoad('continue', 'Continue');
        }
    });
});

$("#clientLogin").submit(function (e) {
    e.preventDefault();
    let form = form2js("clientLogin", ".");

    let { email, password } = form;

    clientSignIn(email, password);
});
var uservar;
const clientSignIn = async (email, password) => {
    try {
        buttonLoad('clientLoginButton')
        let res = await firebase.auth().signInWithEmailAndPassword(email, password);
        let uid = res.user.uid;
        let idToken = await res.user.getIdToken();

        let req = { idToken, uid };

        let url = ABS_PATH + "client/login";
        $.ajax({
            url: url,
            data: req,
            type: "POST",
            success: function (response) {
                console.log(response);
                if (response.status == "success") {
                    $.notify("Logging in", { type: "success" });
                    setTimeout(function () {
                        window.location = ABS_PATH + 'client/dashboard';
                        clearLoad('clientLoginButton', 'Login');
                    }, 2000);
                }
                clearLoad('clientLoginButton', 'Login');
            },
            error: e => console.log(e)
        });
    } catch (e) {
        console.log(e);
        clearLoad('clientLoginButton', 'Login');
        $.notify(e.message, { type: "danger" });
    }
};


$("#clientRegisterForm").submit(e => {
    e.preventDefault();
    var form = form2js("clientRegisterForm", ".");

    if (form.email !== form.emailconfirm) {
        $.notify('Your email do not match.. Please Try again', { type: 'warning' });
        return;
    }
    buttonLoad('signup');

    $.ajax({
        url: ABS_PATH + "client/signup",
        data: form,
        type: "POST",
        success: function (response) {
            $("#clientRegisterForm").trigger("reset");

            console.log(response);
            if (!response.err) {
                $("#close").trigger("click");
                $.notify("A confirmation email has been sent to your inbox", { type: "success" });
            } else {
                $("#close").trigger("click");
                $.notify(response.message, { type: "warning" });
            }
            clearLoad('signup', 'Register');
        },
        error: e => console.log(e)
    });
});

