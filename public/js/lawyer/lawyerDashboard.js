$("#lawyerContact").submit(function (e) {
    e.preventDefault();

    var form = form2js("lawyerContact", ".");

    console.log('submitting..', form);


});