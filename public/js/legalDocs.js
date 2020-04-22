


const renderDocs = (id, document) => {
    let description = document.description.length > 45 ? document.description.substr(0, 21) + '...' : document.description
    return `
    <div class = "col-md-4 mb-4">
        <div class="card h-100">
            <div class="card-body">
                <h4 class="card-title">${document.title || "N/A"}</h4>
                <p class="card-text text-justify" data-toggle = "tooltip" title = "${document.description}">${description}</p>
                <hr/>
                <h5>&#8358;${accounting.formatNumber(document.price) || "N/A"}
                </h5>
                <hr/>
                <button class="btn btn-default btn-md" onclick="payLegalDoc('${id}')"><i class="fa fa-download"></i> Download</button>
            </div>
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
            key: PAYSTACK_KEY,
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
                var processingPayment = $.notify('Confirming payment, please wait', { type: "info", delay: 0 });
                var data = {
                    ref: response.reference,
                    docId: id
                }
                let path = `${ABS_PATH}admin/downloadLegalDoc?docId=${id}&ref=${data.ref}`;
                console.log(path);
                window.location = path
                processingPayment.close();
                // $.ajax({
                //     url: ABS_PATH + "admin/downloadLegalDoc",
                //     type: "POST",
                //     data: data,
                //     success: function (response) {
                //         const url = window.URL.createObjectURL(response);
                //         const a = document.createElement('a');
                //         a.style.display = 'none';
                //         a.href = url;
                //         // the filename you want
                //         a.download = doc.filename;
                //         document.body.appendChild(a);
                //         a.click();
                //         window.URL.revokeObjectURL(url);
                //     },
                //     error: err => {
                //         console.error("error", err)
                //         $.notify(err.message, { type: "warning" });
                //     }
                // });

            },
            onClose: function () {
                alert('window closed', response);
            }
        });
        handler.openIframe();
    }
    payWithPaystack();
}