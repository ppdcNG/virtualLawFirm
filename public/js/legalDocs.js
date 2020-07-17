let LEGAL_DOCS = {};
let LEGAL_DOCS_ARRAY = [];

const renderDocs = (id, document) => {
    let description = document.description ? truncate(document.description, 25) : "No description";
    return `
        <div class="col-md-4 mb-4">
            <div class="card h-100" style="background-color: #C8F2EF;height:250px">
                <div class="card-body">
                    <h4 class="card-title"><a>${document.title || "N/A"}</a></h4>
                    <p class="card-text">${description}</p>
                </div>
                <div class="card-footer">
                    <a class="btn btn-warning btn-sm" onclick="showModal('${id}')">Preview</a>
                    <p class="float-right font-weight-bold pt-2">&#8358; ${accounting.formatNumber(document.price) || "N/A"}</p>
                </div>
            </div>
        </div>
    `
}

const showModal = id => {
    let title = LEGAL_DOCS[id].title;
    let description = LEGAL_DOCS[id].description;
    let price = accounting.formatNumber(LEGAL_DOCS[id].price);
    $('#documentPreviewModal').modal('show');
    console.log(price);

    $("#docID").val(id);
    $("#docTitle").text(title);
    $("#docPrice").text(price);
    $("#docPreview").html(`<p>${description}</p>`);

}

$("#searchFilterForm").change(async (e) => {
    e.preventDefault();
    let form = form2js("searchFilterForm", ".");
    let documentsHTML = "";

    if (form.filter) {
        LEGAL_DOCS_ARRAY.forEach(doc => {
            if (doc.title === form.filter) {
                documentsHTML += renderDocs(doc.id, doc);
                $("#documents").html(documentsHTML);
            }
        })
    } else {
        $("#documents").html('No Matching Documents');
    }
})

$("#downloadDoc").click(() => {
    let doc_id = $("#docID").val();
    let uid = $("#uid").val();
    if (uid == "false") {
        $('#documentPreviewModal').modal('hide');
        $("#loginModal").modal('show');
        return
    }
    else {
        buttonLoadSpinner("downloadDoc");
        console.log('paying...');
        payLegalDoc(doc_id);
    }
    clearLoad("downloadDoc", `<i class="fa fa-download"></i> Download`);
})


$("#resetFilterBtn").click(() => {
    $("#searchFilterForm")[0].reset();
    fetchDoc();
})


const fetchDoc = () => {
    firebase.firestore().collection('legalDocs').onSnapshot((documents) => {
        let documentsHTML = "";

        documents.forEach((doc) => {
            LEGAL_DOCS[doc.id] = doc.data();
            LEGAL_DOCS_ARRAY.push(doc.data());
            documentsHTML += renderDocs(doc.id, doc.data());
        })
        $("#loading").css('display', 'none');
        documentsHTML == '' ? $("#documents").html('No Documents Available') : $("#documents").html(documentsHTML);

        LEGAL_DOCS_ARRAY.forEach(doc => {
            $("#select-filter").append(`<option value="${doc.title}">${doc.title}</option>`)
        })
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
                $.ajax({
                    url: ABS_PATH + "admin/downloadLegalDoc",
                    type: "POST",
                    data: data,
                    success: function (response) {
                        const url = window.URL.createObjectURL(response);
                        const a = document.createElement('a');
                        a.style.display = 'none';
                        a.href = url;
                        // the filename you want
                        a.download = doc.filename;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                    },
                    error: err => {
                        console.error("error", err)
                        $.notify(err.message, { type: "warning" });
                    }
                });
            },
            onClose: function () {
                console.log('window closed');
                clearLoad("downloadDoc", `<i class="fa fa-download"></i> Download`);
            }
        });
        handler.openIframe();
    }
    payWithPaystack();
}