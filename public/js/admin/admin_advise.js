
const fetchquestions = async () => {
    let questions = await firebase.firestore().collection('questions').get().catch((e) => { console.log(e) });
    questionsHTML = "";
    let count = 1;
    questions.forEach((question) => {
        let data = question.data();
        questionsHTML += renderQuestions(data, count, question.id);
        count++
    });

    $("#accordionEx").html(questionsHTML);
}



const replyAdvise = async (id, response) => {
    let timestamp = 0 - new Date().getTime();
    let responseObj = {
        response, timestamp
    }
    let ref = await firebase.firestore().collection('questions').doc(id).update({ response: responseObj });

}

const editResponse = id => {
    $('#answer' + id).attr('contenteditable', 'true').focus();
    $(`#actions${id} .save`).show("slow");
}

const saveResponse = async (count, id) => {
    console.log(id);
    buttonLoad('save' + count);
    let response = $("#answer" + count).text();
    console.log(response);
    let update = await firebase.firestore().collection('questions').doc(id).update({ response }).catch((e) => { console.log(e) });
    clearLoad("save" + count, '<i class="fas fa-save"></i> Save changes')
    $('#answer' + count).attr('contenteditable', 'false');
    $(`#actions${count} .save`).hide("slow");
}