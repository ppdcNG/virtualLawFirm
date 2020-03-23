
const renderDocs = (id, document) => {
    return `
        <div class="card mb-4">
            <div class="card-body">

            <h4 class="card-title">${document.title || "N/A"}</h4>
                <p class="card-text text-justify">${document.description}</p>
                <hr/>
                <h5>${accounting.formatMoney(document.price) || "N/A"}
                    <span class="foat-right" id="numberOfDownloads">10</span> Downloads
                </h5>
                <hr/>
                <button class="btn btn-light-blue btn-md" onclick="payLegalDoc('${id}')">Select</button>

            </div>

        </div>
    `
}

let LEGAL_DOCS = {};
const fetchDoc = () => {
    firebase.firestore().collection('legalDocs').onSnapshot((documents) => {
        let documentsHTML = "";

        documents.forEach((doc) => {
            LEGAL_DOCS[doc.id] = doc.data();
            documentsHTML += renderDocs(doc.id, doc.data());
        })
        $("#loading").css('display', 'none');
        documentsHTML == '' ? $("#documents").html('No Documents Available') : $("#documents").html(documentsHTML);
    });
}

fetchDoc();

const payLegalDoc = id => {
    let doc = LEGAL_DOCS[id];
    let { price } = doc;

    function payWithPaystack() {
        var handler = PaystackPop.setup({
            key: "pk_test_28c944c0f505bdbe163c2d0083127cbaca3cb1c3",
            email: 'customer@email.com',
            amount: price * 100,
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
                var processingPayment = $.notify('Processing payment, please wait', { type: "info", delay: 0 });

                setTimeout(() => {
                    processingPayment.close();
                    $.notify(response.message, { type: response.status });
                }, 1500);

            },
            onClose: function () {
                alert('window closed', response);
            }
        });
        handler.openIframe();
    }
    payWithPaystack();
}