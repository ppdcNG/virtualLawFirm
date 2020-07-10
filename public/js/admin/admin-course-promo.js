var CODES = {};


const listenForCourse = () => {
    courseDb.onSnapshot((snapshot) => {


        let course = snapshot.data();
        if (!course.contentString) {
            $("#contentList2").html("<li class = 'list-group-item'>No content Added Yet</li>");
            return;
        }
        console.log(course);
        js2form('addCourseForm', course);
        let content2HTML = ''
        course.contentString.split('***').forEach(element => {
            content2HTML += "<li class = 'list-group-item'>" + element + "</li>";
        });
        $("#contentList2").html(content2HTML);
    })
}


$("#promoForm").submit(async function (e) {
    e.preventDefault();
    buttonLoadSpinner("submitPromoButton");
    let promo = form2js('promoForm', '.', false);
    let mode = $("#promoMode").val();
    let promoId = $("#promoId").val();
    if (mode == 'edit') {
        await courseDb.collection('promoCodes').doc(promoId).update({ ...promo });
        $("#promoForm")[0].reset();
    }
    if (mode == 'add') {
        await courseDb.collection('promoCodes').doc().set(promo);
        $("#promoForm")[0].reset();
    }
    clearLoad('submitPromoButton')

});


const fetchCodes = () => {
    let coursePath = `courses/${courseId}/promoCodes`;
    let collectionRef = firebase.firestore().collection(coursePath);
    collectionRef.onSnapshot((snapshot) => {
        if (snapshot.empty) {
            console.log('snapshot empty')
            $("#promoCodes").html("<li class = 'list-group-item'>No Code Added Yet</li>");
            return;
        }
        let contentHTML = "";
        snapshot.forEach((snap) => {
            let code = snap.data();
            CODES[snap.id] = code;
            contentHTML += renderPromoCode(code, snap.id)
        });
        $("#promoCodes").html(contentHTML);
    })

}

const renderPromoCode = (code, id) => {

    return `
    <li class="list-group-item d-flex flex-row justify-content-between">
          <div>
            <h5>${code.code}<h5>
            <small class = "small font-weight-light primary-text">%${code.discount}</small>
          </div>
          <div class = "d-flex flex-row justify-content-between">
            <button data-toggle= "tooltip" title = "Edit Code" class = "btn" onclick = "editCode('${id}')"><i class = "fa fa-pen"></i></button>
            <button data-toggle= "tooltip" title = "Delete Code" class = "btn btn-danger" onclick = "deleteCode('${id}')"><i class = "fa fa-trash"></i></button>
          </div>
        
    </li>
    `
}

const editCode = id => {
    let code = CODES[id];
    $("#promoMode").val("edit");
    $("#promoId").val(id);
    js2form('promoForm', code);
    window.location = "#promoForm";
}

const deleteCode = async id => {
    await courseDb.collection('promoCodes').doc(id).delete()
}

listenForCourse();