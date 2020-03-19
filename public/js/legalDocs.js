var pk = "pk_test_28c944c0f505bdbe163c2d0083127cbaca3cb1c3";

const getLegalDoc = fee => {
    var amount = parseInt($("#amount").text());

    function payWithPaystack() {
        var handler = PaystackPop.setup({
            key: pk,
            email: 'customer@email.com',
            amount: 100,
            currency: "NGN",
            ref: '' + Math.floor((Math.random() * 1000000000) + 1),
            metadata: {
                custom_fields: [
                    {
                        display_name: "Mobile Number",
                        variable_name: "mobile_number",
                        value: "+2348012345678"
                    }
                ]
            },
            callback: function (response) {
                alert('success. transaction ref is ' + response.reference);
            },
            onClose: function () {
                alert('window closed');
            }
        });
        handler.openIframe();
    }
    payWithPaystack();
}