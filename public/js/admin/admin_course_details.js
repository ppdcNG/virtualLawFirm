var CONTENTS = {};
var contentList = [];

var OPTIONS = [];
var ContentSortable = null;

var courseId = $("#courseId").val();
var contentString = $("#courseContentList").val();
var VideoPreviewModal = $("#videoPreviewModal");
var QuestionModal = $("#addQuestionModal");
var ConfirmDeleteModal = $("#modalConfirmDelete");



var courseDb = firebase.firestore().collection('courses').doc(courseId);


$(document).ready(() => {
    fetchContent();
    fetchCodes();
    $("#lessonForm").submit(function (e) {
        e.preventDefault();
        let mode = $("#lessonMode").val();
        let lessonId = $("#lessonId").val();
        mode == "add" ? addLesson() : editLesson(lessonId);
    });
    $("#linkForm").submit(function (e) {
        e.preventDefault();
        let mode = $("#linkMode").val();
        let linkId = $("#linkId").val();
        mode == "add" ? addLink() : editLink(linkId);
    });

    //Add Lesson Modal Button
    $("#addLessonButton").click(addLessonButton);
    // Add Link Modal Button
    $("#addLinkButton").click(addLinkButton);

    //Video Upload
    $("#uploadForm").submit(uploadVideo);

    VideoPreviewModal.on('hidden.bs.modal', function (e) {
        let video = document.getElementById('videoPreview');
        video.pause();
    })

    //question option change

    $(".quec").change(function (e) {
        e.preventDefault();
        console.log('option value change');
        answerOptions();

    });

    //addquestion Button
    $("#addQuestionButton").click(function (e) {
        $("#questionForm")[0].reset();
        $("#questionForm input").trigger('change');
        $("#questionOptions").html("");
        $("#answers").html("").trigger('change');
        $("#questionMode").val('add');
        OPTIONS = [];
        QuestionModal.modal('show');
    });

    $("#questionForm").submit(function (e) {
        e.preventDefault();
        let mode = $("#questionMode").val();
        let id = $("#questionId").val();
        mode == 'add' ? addQuestion() : editQuestion(id);
    })
})


const fetchContent = async () => {
    let coursePath = `courses/${courseId}/contents`;
    let collectionRef = firebase.firestore().collection(coursePath).orderBy('position');
    contentList = [];
    collectionRef.onSnapshot((snapshot) => {
        if (snapshot.empty) {
            $("#contentList").html("<li class = 'list-group-item'>No content Added Yet</li>");
            return;
        }
        let contentHTML = "";
        snapshot.forEach((snap) => {
            let content = snap.data();
            contentList.push(content.title);
            CONTENTS[snap.id] = content;
            contentHTML += renderType[content.type](content, snap.id);
        });
        $("#contentList").html(contentHTML);
        let contentString = contentList.join("***");
        console.log(contentString)
        // Sortable
        let container = document.getElementById('contentList');
        ContentSortable = Sortable.create(container, {
            handle: ".dragable",
            animation: 250,
            onUpdate: calculatePositions
        });
        courseDb.update({ contentString }).then(() => {
            console.log("written content", contentString);
        }).catch(e => {
            console.log(e)
        })
    });


}

const addLinkButton = async () => {
    $("#linkForm")[0].reset();
    $("#linkMode").val('add');
    $("#linkType").val('Link');
    $("#linkForm input").trigger('change');

    $("#addLinkModal").modal('show');
}


const addLesson = async _ => {
    let lesson = form2js('lessonForm', '.', false);
    lesson.dateAdded = 0 - new Date().getTime();
    let path = `courses/${courseId}/contents`;
    buttonLoad('saveLessonButton');
    let position = Object.keys(CONTENTS).length + 1;
    lesson.position = position;
    await firebase.firestore().collection(path).add(lesson).catch((e) => { console.log(e) });
    clearLoad('saveLessonButton', 'Save');
    $("#addLessonModal").modal('hide');

}
const addLink = async _ => {
    let link = form2js('linkForm', '.', false);
    let path = `courses/${courseId}/contents`;
    buttonLoad('saveLinkButton');
    let position = Object.keys(CONTENTS).length + 1;
    link.position = position;
    await firebase.firestore().collection(path).add(link).catch((e) => { console.log(e) });
    clearLoad('saveLinkButton', 'Save');
    $("#addLinkModal").modal('hide');
}
const addLessonButton = () => {
    $("#lessonForm")[0].reset();
    $("#lessonMode").val('add');
    $("#lessonType").val('Lesson');
    $("#lessonForm input").trigger('change');
    $("#lessonForm textarea").trigger('change');
    $("#addLessonModal").modal('show');

}
const editLesson = async id => {
    let lesson = form2js("lessonForm", '.', false);
    lesson.type = "Lesson";
    let path = `courses/${courseId}/contents/${id}`;
    let docRef = firebase.firestore().doc(path);
    buttonLoad('saveLessonButton');
    await docRef.update(lesson);
    clearLoad('saveLessonButton', 'Save');
    $('#addLessonModal').modal('hide');
}

const editLink = async id => {
    let link = form2js("linkForm", '.', false);
    link.type = "Link";
    let path = `courses/${courseId}/contents/${id}`;
    let docRef = firebase.firestore().doc(path);
    buttonLoad('saveLinkButton');
    await docRef.update(link);
    clearLoad('saveLinkButton', 'Save');
    $("#addLinkModal").modal('hide');
}

const renderLessonContent = (content, i) => {
    let viewVideo = content.videoUrl ? `<button data-toggle= "tooltip" title = "View Video" class = "btn" onclick = "viewVideo('${i}')" ><i class = "fa fa-eye"></i></button>` : "";

    return `
    <li class="list-group-item d-flex flex-row justify-content-between" data-id = "${i}">
          <div class = "d-flex flex-row">
           <i class="fas fa-arrows-alt align-self-center dragable mr-2"></i>
            <div>
                <h5>${content.title}<h5>
                <small class = "small font-weight-light primary-text">${content.type}</small>
            </div>
          </div>
          <div class = "d-flex flex-row justify-content-between">
            <button data-toggle= "tooltip" title = "Edit Content" class = "btn" onclick = "editContent('${i}')"><i class = "fa fa-pen"></i></button>
            <button data-toggle= "tooltip" title = "Add/Replace Video" class = "btn btn-primary" onclick = "addVideo('${i}')"><i class = "fa fa-video"></i></button>
            ${viewVideo}
            <button data-toggle= "tooltip" title = "Delete Content" class = "btn btn-danger" onclick = "deleteConfirm('${i}')"><i class = "fa fa-trash"></i></button>
          </div> 
    </li>
    `
}

const renderQuestionContent = (content, i) => {

    return `
    <li class="list-group-item d-flex flex-row justify-content-between" data-id = "${i}">
          <div class = "d-flex flex-row">
            <i class="fas fa-arrows-alt align-self-center dragable mr-2"></i>
            <div>
                <h5>${content.title}<h5>
                <small class = "small font-weight-light secondary-text">${content.type}</small>
            </div>
          </div>
          <div class = "d-flex flex-row justify-content-between">
            <button data-toggle= "tooltip" title = "Edit Content" class = "btn" onclick = "editContent('${i}')"><i class = "fa fa-pen"></i></button>
            <button data-toggle= "tooltip" title = "Delete Content" class = "btn btn-danger" onclick = "deleteConfirm('${i}')"><i class = "fa fa-trash"></i></button>
          </div>
        
    </li>
    `
}
const renderLinkContent = (content, i) => {

    return `
    <li class="list-group-item d-flex flex-row justify-content-between" data-id = "${i}">
          <div class = "d-flex flex-row">
            <i class="fas fa-arrows-alt align-self-center dragable mr-2"></i>
            <div>
                <h5><a href = "${content.url}" >${content.title}</a><h5>
                <small class = "small font-weight-light secondary-text">Further Reading</small>
            </div>
          </div>
          <div class = "d-flex flex-row justify-content-between">
            <button data-toggle= "tooltip" title = "Edit Content" class = "btn" onclick = "editContent('${i}')"><i class = "fa fa-pen"></i></button>
            <button data-toggle= "tooltip" title = "Delete Content" class = "btn btn-danger" onclick = "deleteConfirm('${i}')"><i class = "fa fa-trash"></i></button>
          </div>
        
    </li>
    `
}
const editContent = id => {
    console.log(id);
    let content = CONTENTS[id];
    console.log(content);
    if (content.type == 'Lesson') {
        $("#lessonMode").val('edit');
        $("#lessonId").val(id);
        js2form('lessonForm', content);
        $("#lessonForm input").trigger('change');
        $("#lessonForm textarea").trigger('change');
        $("#addLessonModal").modal('show');
    }
    if (content.type == "Question") {
        $("#questionMode").val('edit');
        $("#questionId").val(id);
        OPTIONS = [...content.options];
        renderOptions();
        answerOptions();
        js2form('questionForm', content, '.');
        $("#questionForm textarea").trigger('change');
        $("#answers").val(content.answers);
        $("#answers").trigger('change');
        QuestionModal.modal('show');

    }
    if (content.type == "Link") {
        $("#linkMode").val('edit');
        $("#linkId").val(id);
        js2form('linkForm', content);
        $("#linkForm input").trigger('change');
        $("#addLinkModal").modal('show');
    }
}

const deleteContent = async () => {
    let id = $("#delId").val();
    let path = `courses/${courseId}/contents/${id}`;
    let storagePath = `courses/${courseId}/${id}`;
    let docRef = firebase.firestore().doc(path);
    let content = CONTENTS[id];

    if (content.type == "Lesson" && content.videoUrl) {
        await firebase.storage().ref(storagePath).delete();
    }
    docRef.delete();
    ConfirmDeleteModal.modal('hide');
}

const deleteConfirm = id => {

    $("#delId").val(id);
    ConfirmDeleteModal.modal('show');
}
///Video Content
const uploadVideo = (e) => {
    e.preventDefault();
    let lessonId = $("#videoLessonId").val();
    let file = $("#module")[0].files[0];
    console.log(file);
    if (!file || file.type != 'video/mp4') {
        $.notify('Invalid File Format, Make sure video is mp4 format', { type: 'danger', delay: 2300 });
        return;
    }
    let storagePath = `courses/${courseId}/${lessonId}`;

    $("#addVideoModal").modal('hide');
    $("#videoProgressModal").modal('show');
    let uploadTask = firebase.storage().ref(storagePath).put(file);

    uploadTask.on('state_changed', videoUploadProgress, function (error) {
        $.notify(error.message, { type: 'danger', delay: 2000 });
    }, async function () {

        let url = await uploadTask.snapshot.ref.getDownloadURL();
        let docpath = `courses/${courseId}/contents/${lessonId}`;
        let docRef = firebase.firestore().doc(docpath);
        await docRef.update({ videoUrl: url });
        $("#videoProgressModal").modal('hide');
        $.notify('Video Uploaded', { type: "success", delay: 2500 });
    });

}
const addVideo = i => {
    let content = CONTENTS[i];
    let title = `Add/Edit video for Lesson '${content.title}'`;
    $("#addVideoTitle").text(title);
    $("#videoLessonId").val(i);
    $("#addVideoModal").modal('show');
}

const viewVideo = id => {
    let video = document.getElementById('videoPreview');
    let content = CONTENTS[id];
    console.log(content);
    video.setAttribute('src', content.videoUrl);
    video.load();
    $("#videoPreviewModal").modal('show');
}

const videoUploadProgress = snapshot => {
    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log(progress);
    document.getElementById('progressBar').style.width = `${progress}%`;
}


///Questions

const renderOptions = () => {
    let optionsHTML = '';
    OPTIONS.forEach((option, i) => {
        let html = `
        <div class="mb-3 md-form" id = "option${i + 1}">
            <label for="title">Option ${i + 1}</label>
            <input data-id = "${i}" type="text" name="options[]" class="form-control question-option" value = "${option}" required>
            <i class="fas fa-minus-circle" onclick = "removeOption('${i + 1}')"></i>
        </div>`
        optionsHTML += html
    })

    $("#questionOptions").html(optionsHTML);
    $(".question-option").change(function (e) {
        e.preventDefault();
        let id = parseInt(this.getAttribute('data-id'));
        OPTIONS[id] = this.value;
        console.log('option value change');
        answerOptions();
    });
    $(".question-option").trigger('change');
}

const addOption = () => {
    OPTIONS.push('');
    renderOptions();
}

const removeOption = (id) => {
    let i = id - 1;
    OPTIONS.splice(i, 1);
    renderOptions();
    answerOptions();
}

const answerOptions = () => {

    if (OPTIONS.length < 1) {
        return;
    }
    let optionsHTML = "";
    OPTIONS.forEach((option) => {
        optionsHTML += `<option value = "${option}">${option}</option>`;
    });

    $("#answers").html(optionsHTML);
    $("#answers").trigger('change');

}

const editQuestion = async (id) => {
    let question = form2js('questionForm', '.', false);
    console.log(question);
    let path = `courses/${courseId}/contents/${id}`;
    buttonLoad("saveQuestionButton");
    await firebase.firestore().doc(path).update(question).catch((e) => { console.log(e) });
    clearLoad('saveQuestionButton', 'Save');
    QuestionModal.modal('hide');

}

const addQuestion = async () => {
    let question = form2js('questionForm', '.', false);
    question.dateAdded = 0 - new Date().getTime();
    let path = `courses/${courseId}/contents`;
    console.log(path)
    let position = Object.keys(CONTENTS).length;
    question.position = position;
    buttonLoad('saveQuestionButton');
    await firebase.firestore().collection(path).add(question).catch((e) => { console.log(e) });
    clearLoad('saveQuestionButton', 'Save');
    QuestionModal.modal('hide');

}

const editCourse = async  course => {
    buttonLoadSpinner('submitCourseFormButton');
    let id = $("#courseId").val();
    let dbRef = firebase.firestore().collection('courses').doc(id);
    let notification = $.notify('Please Wait...', { type: 'info', delay: 0 });

    try {
        await dbRef.update({ ...course });
        notification.close();
        $.notify('Course Edited Succesfully', { type: 'success', delay: 2500 });
        $("#addCourseForm")[0].reset();
        $("#tags").trigger('change');
        clearLoad('submitCourseFormButton', 'Save');
        $("#courseModal").modal('hide');

    }
    catch (e) {
        console.log(e)
        notification.close();
        clearLoad('submitCourseFormButton')
        $.notify('OOps an error occured', { type: 'danger', delay: 2500 });
    }
}

$('#addCourseForm').submit(function (e) {
    e.preventDefault();
    let course = form2js('addCourseForm', '.', false);
    let mode = $("#courseMode").val();
    editCourse(course);
});

const calculatePositions = async (evt) => {
    console.log(evt);
    const batch = firebase.firestore().batch();
    const collection = courseDb.collection('contents');
    $("#contentList li").each((id, ele) => {

        let contentId = ele.getAttribute("data-id");
        let db = collection.doc(contentId);
        batch.update(db, { position: parseInt(id) })
        console.log(ele)
        console.log(id);
    });
    await batch.commit();
}


var renderType = {
    Question: renderQuestionContent,
    Lesson: renderLessonContent,
    Link: renderLinkContent
}




