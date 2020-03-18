
const fetchquestions = async () => {
    let questions = await firebase.firestore().collection('questions').get().catch((e) => { console.log(e) });
    questionsHTML = "";
    questions.forEach((question) => {
        let data = question.data();
        questionsHTML += renderQuestions(data, question.id);
    })
}



const renderQuestions = (question, id) => {

    console.log(questions)
    return `
    
    
    `
}


const replyAdvise = async (id, response) => {
    let timestamp = 0 - new Date().getTime();
    let responseObj = {
        response, timestamp
    }
    let ref = await firebase.firestore().collection('questions').doc(id).update({ response: responseObj });

}