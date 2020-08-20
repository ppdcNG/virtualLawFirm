

$("#terms").change((e) => {
    let checked = $("#terms").is(':checked');
    if (checked) {
        $("#terms").removeClass('is-invalid');
        $("#clientSignupButton").removeClass('disabled');
    }
    else {
        $("#clientSignupButton").addClass("disabled");
    }

})
$("#gotrecover").click(dismiss);
$("#gotsignup").click(dismiss);
$("#toggleLawyerSignup").click(e => { showLaywerModal('signup') });
$("#toggleLawyerLogin").click(e => { showLaywerModal('login') })

$("#signup").click(function (e) {
    console.log('clicked');
});

const showLaywerModal = function (type) {
    console.log('showing');
    $("#loginModal").modal('hide');
    if (type == 'signup') {
        $("#lawyer-signup-tab").tab('show');
        $("#lawyerLoginModal").modal('show');
    }
    if (type == 'login') {
        $("#lawyerLoginModal").modal('show');
        $("#lawyer-login-tab").tab('show');

    }
}
const showRecovery = () => {
    $("#loginModal").modal('hide');
    $("#lawyerLoginModal").modal('hide');
    $("#forgotModal").modal('show');
}

const clientTab = type => {
    if (type == 'signup') {
        $("#signup-tab").tab('show');
    }
}

function dismiss(type) {
    console.log('clear called');
    if (type == 'recover') {
        $("#recoverForm").fadeIn();
        $("#forgotModal").modal('hide');
        $("#recoverComplete").addClass('recover-success');
    }

    if (type == 'signup') {
        $("#myTab").fadeIn();
        $("#myTabContent").fadeIn();
        $("#signupComplete").addClass('signup-success');
    }
    if (type == "lawyersignup") {
        $("#lawyerMyTab").show()
        $("#lawyerMyTabContent").show();
        $("#lawyerSignupComplete").addClass('signup-success');
        $("#lawyerLoginModal").modal('hide');
    }
}

$("#clientConfirm").submit(function (e) {
    e.preventDefault();
    let formdata = new FormData(document.getElementById('clientConfirm'));
    var form = form2js("clientConfirm", ".");
    if (form.password !== form.confirmPassword) {
        $.notify("Passwords must match", { type: "warning", z_index: 5000 });
        $("#confirmError").html("Passwords must match");
        $("#confirmError").removeClass('valid');
        $("#password").addClass('is-invalid');
        $("#confirmPassword").addClass('is-invalid');
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
            if (!response.err && response.email) {
                $.notify(response.message, { type: "success", delay: 3000, z_index: 5000 });
                $.notify("Signing In", { type: "primary", z_index: 5000 });
                $("#clientConfirm").hide();
                $("#recoverComplete").removeClass('signup-success');
                clientSignIn(response.email, form.password, () => { window.location = ABS_PATH + 'client/dashboard' });
            } else {
                $.notify(response.message, { type: "warning", z_index: 5000 });
                $("#confirmError").html(response.message);
                $("#confirmError").removeClass('valid');
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
const clientSignIn = async (email, password, callback) => {
    try {
        buttonLoad('clientLoginButton')
        let res = await firebase.auth().signInWithEmailAndPassword(email, password);
        let uid = res.user.uid;
        localStorage.setItem("uid", uid);
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
                    $("#loginModal").modal('hide');
                    $.notify("Logging in", { type: "success", z_index: 5000 });
                    setTimeout(function () {
                        if (callback) {
                            callback()
                        } else { window.location.reload(); }
                        clearLoad('clientLoginButton', 'Login');
                    }, 300);
                }
                clearLoad('clientLoginButton', 'Login');
            },
            error: e => console.log(e)
        });
    } catch (e) {
        console.log(e);
        let message = e.code == "auth/wrong-password" ? "Wrong password. Try again or click Forgot password to reset it." : e.message;
        clearLoad('clientLoginButton', 'Login');
        $("#loginError").html(message);
        $("#loginError").removeClass('valid');
        $.notify(message, { type: "danger", z_index: 5000 });
    }
};


$("#clientRegisterForm").submit(e => {
    e.preventDefault();
    var form = form2js("clientRegisterForm", ".");

    if (!$("#terms").is(':checked')) {
        $.notify('Please accept the terms and conditions', { type: "warning", z_index: 5000 });
        $("#terms").addClass('is-invalid');
        return false
    }

    buttonLoad('clientSignupButton');
    $.ajax({
        url: ABS_PATH + "client/signup",
        data: form,
        type: "POST",
        success: function (response) {
            $("#clientRegisterForm").trigger("reset");

            console.log(response);
            if (!response.err) {
                $("#close").trigger("click");
                $.notify("A confirmation email has been sent to your inbox", { type: "success", z_index: 5000 });
                $("#myTab").hide();
                $("#myTabContent").hide();
                $("#clientRegisterForm").trigger('reset');
                $("#signupComplete").removeClass('signup-success');
            } else {
                $("#signupError").html(response.message);
                $("#signupError").removeClass('valid');
                $.notify(response.message, { type: "warning" });
            }
            clearLoad('clientSignupButton', 'Sign Up');
        },
        error: e => console.log(e)
    });
});

$("#recoverForm").submit(e => {
    e.preventDefault();
    var form = form2js("recoverForm", ".");


    buttonLoad('recoverButton');

    $.ajax({
        url: ABS_PATH + "recoverPassword",
        data: form,
        type: "POST",
        success: function (response) {
            $("#recoverForm").trigger("reset");

            console.log(response);
            if (!response.err) {

                $.notify("An email has been sent to your inbox follow the prompt to reset your password", { type: "success", z_index: 5000 });

                $("#recoverForm").hide();
                $("#recoverComplete").removeClass('recover-success');
            } else {
                $("#recoverError").html(response.message);
                $("#recoverError").removeClass('valid');
                $.notify(response.message, { type: "warning", z_index: 5000 });
            }
            clearLoad('recoverButton', 'Sign Up');
        },
        error: e => console.log(e)
    });
})

