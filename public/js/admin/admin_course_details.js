var CONTENTS = {};

var OPTIONS = [];

var courseId = $("#courseId").val();
var VideoPreviewModal = $("#videoPreviewModal");
var QuestionModal = $("#addQuestionModal");
var ConfirmDeleteModal = $("#modalConfirmDelete");


$(document).ready(() => {
    fetchContent();
    $("#lessonForm").submit(function (e) {
        e.preventDefault();
        let mode = $("#lessonMode").val();
        let lessonId = $("#lessonId").val();
        mode == "add" ? addLesson() : editLesson(lessonId);
    });

    //Add Lesson Modal Button
    $("#addLessonButton").click(addLessonButton);

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


const fetchContent = () => {
    let coursePath = `courses/${courseId}/contents`;
    let collectionRef = firebase.firestore().collection(coursePath);
    collectionRef.onSnapshot((snapshot) => {
        if (snapshot.empty) {
            $("#contentList").html("<li class = 'list-group-item'>No content Added Yet");
            return;
        }
        let contentHTML = "";
        snapshot.forEach((snap) => {
            let content = snap.data();
            CONTENTS[snap.id] = content;
            contentHTML += content.type == "Lesson" ? renderLessonContent(content, snap.id) : renderQuestionContent(content, snap.id);
        });
        $("#contentList").html(contentHTML);
    })

}


const addLesson = async _ => {
    let lesson = form2js('lessonForm', '.', false);
    let path = `courses/${courseId}/contents`;
    buttonLoad('saveLessonButton');
    await firebase.firestore().collection(path).add(lesson).catch((e) => { console.log(e) });
    clearLoad('saveLessonButton', 'Save');
    $("#addLessonModal").modal('hide');

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

const renderLessonContent = (content, i) => {
    let viewVideo = content.videoUrl ? `<button data-toggle= "tooltip" title = "View Video" class = "btn" onclick = "viewVideo('${i}')" ><i class = "fa fa-eye"></i></button>` : "";

    return `
    <li class="list-group-item d-flex flex-row justify-content-between">
          <div>
            <h5>${content.title}<h5>
            <small class = "small font-weight-light primary-text">${content.type}</small>
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
    <li class="list-group-item d-flex flex-row justify-content-between">
          <div>
            <h5>${content.title}<h5>
            <small class = "small font-weight-light secondary-text">${content.type}</small>
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
    if (content.type = "Question") {
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
    let path = `courses/${courseId}/contents`;
    buttonLoad('saveQuestionButton');
    await firebase.firestore().collection(path).add(question).catch((e) => { console.log(e) });
    clearLoad('saveQuestionButton', 'Save');
    QuestionModal.modal('hide');

}

