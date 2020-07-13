
var PROGRESSLIST = {};
var CONTENTLIST = {};
var CONTENTORDER = [];
var currentVideo = null;
var uid = $("#uid").val();
var courseId = $("#courseId").val();

let courseDb = firebase.firestore().doc(`clients/${uid}/courseList/${courseId}`)
$(document).ready(function () {
    fetchCourseContent();
    let videoPlayer = document.getElementById('videoPreview');
    videoPlayer.addEventListener('ended', markComplete, false);
});

const fetchCourseContent = () => {
    let courseId = $("#courseId").val();
    let url = ABS_PATH + `e-learning/courseContent?id=${courseId}`;
    $.ajax({
        url,
        type: "POST",
        success: function (response) {
            console.log("success", response);
            CONTENTLIST = response.contentList;
            PROGRESSLIST = response.userCourseData.progressList ? response.userCourseData.progressList : {};
            CONTENTORDER = response.contentOrder
            renderContent();
            calculateProgress();


        },
        error: err => {
            console.error("error", err)
            $.notify(response.message, { type: "warning" });
        }
    });
}





const renderContent = () => {
    let contentHTML = ""

    Object.keys(CONTENTLIST).forEach((key) => {
        let content = CONTENTLIST[key];
        console.log(content)
        contentHTML += content.type == 'Lesson' ? renderLessonContent(content, key) : renderQuestionContent(content, key);
    });

    $("#contents").html(contentHTML);
}

const renderLessonContent = (content, i) => {
    let viewVideo = content.videoUrl ? `<button data-toggle= "tooltip" title = "View Video" class = "btn btn-primary" onclick = "viewVideo('${i}')" ><i class = "fa fa-play"></i></button>` : "";
    let statusIcon = PROGRESSLIST[i] ? `<i class = "fa fa-check text-green ml-3"></i>` : `<i class="far fa-clock accent-color ml-3"></i>`;
    let title = truncate(content.title, 45);
    return `
    <li class="list-group-item d-flex flex-row justify-content-between">
          <div>
            <h5 data-toggle = "tooltip" title = "${content.title}">${title}<h5>
            <small class = "small font-weight-light primary-text">Module</small>
          </div>
          <div class = "d-flex flex-row justify-content-between align-items-center">
            ${viewVideo}
            ${statusIcon}
          </div>
    </li>
    `
}


const renderQuestionContent = (content, i) => {

    let viewQuiz = content.options ? `<button data-toggle= "tooltip" title = "View Quiz" class = "btn " onclick = "showQuiz('${i}')" ><i class="fas fa-vial"></i></button>` : "";
    let statusIcon = PROGRESSLIST[i] ? `<i class = "fa fa-check text-green"></i>` : `<i class="far fa-clock accent-color ml-3"></i>`
    let title = truncate(content.title, 50)

    return `
    <li class="list-group-item d-flex flex-row justify-content-between">
          <div>
            <h5>${title}<h5>
            <small class = "small font-weight-light primary-text">Quiz</small>
          </div>
          <div class = "d-flex flex-row justify-content-between align-items-center">
            ${viewQuiz}
            ${statusIcon}
          </div>
    </li>
    `
}

const viewVideo = id => {
    let play = checkComplete(id);
    if (!play) {
        $.notify('You need to take the previous module/quiz before this', { type: 'warning', delay: 3000 });
        return;
    }
    currentVideo = id;
    let video = document.getElementById('videoPreview');
    let content = CONTENTLIST[id];
    console.log(content);
    if (content.videoUrl) {
        video.setAttribute('src', content.videoUrl);
        video.load();
        $("#videoPreviewModal").modal('show');
    }

}



const markComplete = async (e) => {
    console.log(e);
    if (!PROGRESSLIST[currentVideo]) {
        console.log(PROGRESSLIST);
        PROGRESSLIST[currentVideo] = true;
        let progress = calculateProgress();
        await courseDb.update({ progressList: PROGRESSLIST, progress });
        renderContent();

    }

    $("#nexbutton").show()

}

const checkComplete = id => {
    index = CONTENTORDER.indexOf(id);
    if (index > 0) {
        let prev = CONTENTORDER[index - 1];
        return PROGRESSLIST[prev] ? true : false
    }
    return true;
}

const nextContent = () => {
    let next = CONTENTORDER.indexOf(currentVideo) + 1;
    let nextId = CONTENTORDER[next];
    let nextCourse = CONTENTLIST[nextId];
    nextCourse.type == "Lesson" ? viewVideo(nextId) : viewQuiz(nextId);
}

const calculateProgress = () => {
    let progressNumber = Object.keys(PROGRESSLIST).length;
    let courseNumber = Object.keys(CONTENTLIST).length;
    console.log(progressNumber, courseNumber)
    let percentage = (progressNumber / courseNumber) * 100;
    $("#progress").text(percentage);
    return percentage;
}

const renderOption = (option, i) => {
    return `<div class="custom-control custom-checkbox mb-3 p-2">
                <input type="checkbox" name = "answers[]" value = "${option}" class="custom-control-input" id="input-${i}" >
                <label class="custom-control-label" for="input-${i}">${option}</label>
                <span class = "invalid-feedback">Not Correct Answer</span>
                <span class = "valid-feedback">Nice Job Correct Answer</span>
            </div>`
}

const showQuiz = (i) => {
    let question = CONTENTLIST[i];
    let optionsHTML = "";
    currentVideo = i;
    question.options.forEach((value, i) => {
        optionsHTML += renderOption(value, i)
    });
    $("#quizQuestion").text(question.title)
    $("#quizOptions").html(optionsHTML);
    $("#quizId").val(i);

    $("#quizModal").modal('show');
}

$("#quizForm").submit(function (e) {
    e.preventDefault();
    let form = form2js('quizForm', '.', false);
    console.log(form)
    let question = CONTENTLIST[form.id];
    let correct = form.answers.sort().join('') === question.answers.sort().join('')
    if (correct) {
        question.options.map((value, i) => {
            let id = form.answers.indexOf(value);
            if (id >= 0) $("#input-" + i).addClass('is-valid').removeClass('is-invalid');
            else {
                $("#input-" + i).removeClass('is-valid').removeClass('is-invalid');
            }
        });

        markComplete();
    }
    else {
        question.options.map((value, i) => {
            let id = form.answers.indexOf(value);
            if (id >= 0) $("#input-" + i).addClass('is-invalid');
            else {

                $("#input-" + i).removeClass('is-valid').removeClass('is-invalid');
            }
        });
    }

});