var pk = "pk_test_28c944c0f505bdbe163c2d0083127cbaca3cb1c3";


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
                <button class="btn btn-light-blue btn-md" onclick="payLegalDoc('${id})">Select</button>

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
        console.log(LEGAL_DOCS);
        console.log(documentsHTML);
        // documentsHTML == '' ? $("#documentList").html('No Documents Available') : $("#documentList").html(documentsHTML);
        // $("#loading").css('display', 'none');
    });
}

fetchDoc();

const payLegalDoc = fee => {
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