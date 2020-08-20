


var PROGRESSLIST = {};
var CONTENTLIST = {};
var CONTENTORDER = [];
var currentVideo = null;
var uid = $("#uid").val();
var courseId = $("#courseId").val();
var quizAttempts = {

};

$('#videoPreviewModal').on('hidden.bs.modal', function (e) {
    let videoPlayer = document.getElementById('videoPreview');
    videoPlayer.pause();
})

let courseDb = firebase.firestore().doc(`clients/${uid}/courseList/${courseId}`)
$(document).ready(function () {
    fetchCourseContent();
    let videoPlayer = document.getElementById('videoPreview');
    videoPlayer.addEventListener('ended', (e) => { $("#nxtBtn").show(); markComplete(e) }, false);
});






const renderContent = () => {
    let contentHTML = ""

    Object.keys(CONTENTLIST).forEach((key) => {
        let content = CONTENTLIST[key];
        console.log(content)
        contentHTML += renderType[content.type](content, key);
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


const renderLinkContent = (content, i) => {


    let title = truncate(content.title, 50)

    return `
    <li class="list-group-item d-flex flex-row justify-content-between">
          <div>
            <h5>Further Readings<h5>
            <small class = "small font-weight-light primary-text">Further Readings</small>
          </div>
          <div class = "d-flex flex-row justify-content-between align-items-center">
            <button data-toggle= "tooltip" title = "Further Readings" class = "btn " onclick = "viewFurtherReadings('${i}')" ><i class="fas fa-eye"></i></button>
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
            <h5>Course Quiz<h5>
            <small class = "small font-weight-light primary-text">Multiple choice</small>
          </div>
          <div class = "d-flex flex-row justify-content-between align-items-center">
            ${viewQuiz}
            ${statusIcon}
          </div>
    </li>
    `
}
const renderType = {
    Lesson: renderLessonContent,
    Question: renderQuestionContent,
    Link: renderLinkContent

}


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
            quizAttempts = response.userCourseData.quizAttempts ? response.userCourseData.quizAttempts : {};
            CONTENTORDER = response.contentOrder
            $("#numberRated").text(response.count);
            renderContent();
            calculateProgress();


        },
        error: err => {
            console.error("error", err)
            $.notify(response.message, { type: "warning" });
        }
    });
}

const viewFurtherReadings = id => {
    let play = checkComplete(id);
    if (!play) {
        $.notify('You need to take the previous module/quiz before this', { type: 'warning', delay: 3000 });
        return;
    }
    currentVideo = id;
    let content = CONTENTLIST[id];
    $("#furtherReadingtitle").text(content.title)
    $("#urlButton").html(`<a  target="_blank"  href = "${content.url}"><i class = "fa fa-link"></i></a>`);
    $("#furtherReadingsModal").modal('show');
    markComplete();
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
        video.setAttribute('muted', false);
        video.load();
        console.log("bitch")
        $("#nxtBtn").hide();
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
    let contentType = {
        Question: showQuiz,
        Lesson: viewVideo,
        Link: viewFurtherReadings
    }
    let next = CONTENTORDER.indexOf(currentVideo) + 1;
    let nextId = CONTENTORDER[next];
    let nextCourse = CONTENTLIST[nextId];

    if (nextCourse) contentType[nextCourse.type](nextId);
    else $('.modal').modal('hide');
}

const calculateProgress = () => {
    let progressNumber = Object.keys(PROGRESSLIST).length;
    let courseNumber = Object.keys(CONTENTLIST).length;
    console.log(progressNumber, courseNumber);
    if (progressNumber == courseNumber) {
        $("#certButton").removeClass("invisible")
    }
    let percentage = (progressNumber / courseNumber) * 100;
    percentage = parseInt(percentage);
    $("#progress").text(percentage);
    return percentage;
}

const renderOption = (option, i) => {
    return `<div class="custom-control custom-checkbox mb-3 p-2">
                <input type="checkbox" name = "answers[]" value = "${option}" class="custom-control-input" id="input-${i}" >
                <label class="custom-control-label" for="input-${i}">${option}</label>
                <span class = "invalid-feedback">Incorrect Answer</span>
                <span class = "valid-feedback">Correct Answer</span>
            </div>`
}

const showQuiz = async (i) => {
    let question = CONTENTLIST[i];
    let optionsHTML = "";
    currentVideo = i;
    if (quizAttempts.quizId && quizAttempts.quizId == i && quizAttempts.blocked) {
        console.log("trials exceed wait 8 hours");
        console.log(quizAttempts);
        let now = new Date().getTime();
        let eighhours = 60 * 60 * 2 * 1000;

        if (now - parseInt(quizAttempts.timeBlocked) < eighhours) {
            let timepassed = (quizAttempts.timeBlocked + eighhours) - now;
            let hours = Math.floor(timepassed / (60 * 60 * 1000))
            let minutes = Math.floor((timepassed % (60 * 60 * 1000)) / (60 * 1000));
            $("#hoursRemaining").text(`${hours}hr : ${minutes}min`);
            $("#waitModal").modal('show');
            console.log(hours, minutes)
            return

        }
        quizAttempts.blocked = false;
        quizAttempts.timeBlocked = "";
        quizAttempts.numberOfAttempts = 0;
        await courseDb.update({ quizAttempts });
    }
    question.options.forEach((value, i) => {
        optionsHTML += renderOption(value, i)
    });
    $("#attempts").text(quizAttempts.numberOfAttempts || 0);
    if (PROGRESSLIST[i]) $("#attemptContainer").html(`<i class = "fa fa-check"></i> Quiz Completed`);
    $("#quizQuestion").text(question.title)
    $("#quizOptions").html(optionsHTML);
    $("#quizId").val(i);

    $("#quizModal").modal('show');
}

$("#quizForm").submit(async function (e) {
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
        await courseDb.update({ quizAttempts: null })
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


        quizAttempts.quizId = form.id;
        quizAttempts.numberOfAttempts = quizAttempts.numberOfAttempts ? quizAttempts.numberOfAttempts + 1 : 1;
        quizAttempts.blocked = quizAttempts.numberOfAttempts >= 3 ? true : false;
        quizAttempts.timeBlocked = quizAttempts.blocked ? new Date().getTime() : "";
        $("#attempts").text(quizAttempts.numberOfAttempts);
        await courseDb.update({ quizAttempts });
        if (quizAttempts.numberOfAttempts >= 3) {
            $("#quizModal").modal('hide');
            $("#waitModal").modal('show');
        }

    }

});



const downloadCert = () => {
    let progressNumber = Object.keys(PROGRESSLIST).length;
    let courseNumber = Object.keys(CONTENTLIST).length;
    // if (progressNumber !== courseNumber) return;
    let docOptions = {
        name: $("#displayName").val(),
        title: $("#courseTitle").val(),
        date: moment().format("Do MMM YYYY"),
        author: $("#author").val()

    }

    let doc = cerDoc(docOptions);
    let fonts = {
        JosefinSans: {
            bold: ABS_PATH + 'fonts/JosefinSans-Bold.ttf'
        },
        Poppins: {
            normal: ABS_PATH + 'fonts/Poppins-Regular.ttf',
            bold: ABS_PATH + 'fonts/Poppins-Bold.ttf'
        },
        Sacramento: {
            normal: ABS_PATH + 'fonts/Sacramento-Regular.ttf'
        },
    }
    pdfMake.createPdf(doc, null, fonts).open();
}

const cerDoc = (options) => {
    return {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [0, 0],
        watermark: { text: 'Lawtrella', color: '#9C8282', opacity: 0.2, margin: [100, 50], bold: true, italics: false },
        content: [
            {
                table: {
                    widths: [170, "*"],

                    body: [
                        [{
                            fillColor: "#3BD1C7",
                            svg: `<svg width="243" height="742" viewBox="0 0 243 742" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="243" height="2480" fill="#3BD1C7"/>
                        <g clip-path="url(#clip0)">
                        <path d="M184.528 602.975L198.719 589.087C202.949 585.082 200.976 577.965 195.428 576.638L176.094 571.704L181.544 552.566C183.085 547.062 177.894 541.87 172.391 543.41L153.26 548.862L148.328 529.522C147.022 524.06 139.826 522.063 135.884 526.23L122 540.531L108.117 526.23C104.219 522.11 96.9928 523.998 95.6726 529.523L90.7401 548.862L71.6088 543.411C66.1044 541.869 60.9157 547.063 62.4556 552.567L67.9057 571.704L48.5723 576.639C43.0213 577.966 41.0528 585.084 45.2811 589.087L59.4718 602.975L45.2811 616.863C41.0509 620.868 43.0234 627.984 48.572 629.311L67.9054 634.246L62.4553 653.383C60.9151 658.888 66.1056 664.08 71.6085 662.539L90.7394 657.087L95.672 676.427C97.0419 682.16 104.219 683.839 108.116 679.719L122 665.524L135.883 679.719C139.741 683.882 146.989 682.03 148.327 676.427L153.26 657.087L172.391 662.539C177.895 664.081 183.084 658.887 181.544 653.383L176.094 634.246L195.427 629.311C200.978 627.984 202.947 620.866 198.718 616.863L184.528 602.975V602.975Z" fill="#C8F2EF"/>
                        </g>
                        <g clip-path="url(#clip1)">
                        <path d="M109.721 525.754L84.4728 483.676C83.4346 481.945 81.9659 480.512 80.2095 479.517C78.4532 478.523 76.4692 478 74.4507 478H33.8549C29.1251 478 26.3567 483.321 29.0667 487.197L69.7063 545.254C80.5611 535.112 94.367 528.15 109.721 525.754ZM209.146 478H168.55C164.444 478 160.639 480.155 158.528 483.676L133.279 525.754C148.633 528.15 162.439 535.112 173.294 545.251L213.934 487.197C216.644 483.321 213.875 478 209.146 478ZM121.5 536.438C85.9994 536.438 57.219 565.218 57.219 600.719C57.219 636.22 85.9994 665 121.5 665C157.001 665 185.781 636.22 185.781 600.719C185.781 565.218 157.001 536.438 121.5 536.438ZM155.292 593.874L141.438 607.373L144.715 626.446C145.299 629.864 141.698 632.476 138.633 630.862L121.5 621.859L104.371 630.862C101.303 632.487 97.7052 629.861 98.2896 626.446L101.566 607.373L87.7124 593.874C85.2215 591.449 86.5984 587.216 90.0316 586.719L109.181 583.929L117.738 566.573C118.509 565.01 119.999 564.239 121.493 564.239C122.994 564.239 124.495 565.021 125.266 566.573L133.823 583.929L152.972 586.719C156.406 587.216 157.783 591.449 155.292 593.874V593.874Z" fill="#EA9216"/>
                        </g>
                        <defs>
                        <clipPath id="clip0">
                        <rect width="158" height="158" fill="white" transform="translate(43 524)"/>
                        </clipPath>
                        <clipPath id="clip1">
                        <rect width="187" height="187" fill="white" transform="translate(28 478)"/>
                        </clipPath>
                        </defs>
                        </svg>`,
                            fit: [170, 600]
                        },
                        {
                            fillColor: "#f1e6d6",
                            stack: [
                                {
                                    text: 'Certificate of Completion',
                                    style: "cursive"
                                },
                                {
                                    text: 'This certificate is awarded to',
                                    style: "awardee"
                                },
                                {
                                    text: options.name,
                                    style: 'name'
                                },
                                {
                                    text: [
                                        'Having completed all course ware for the Lawtrella online  course ',
                                        { text: options.title, bold: true }
                                    ],
                                    style: "course"

                                },
                                {
                                    columns: [
                                        {
                                            stack: [
                                                { text: "Date Awarded" },
                                                { text: options.date, style: "boldFooter" }
                                            ],
                                            margin: [30, 0]
                                        },
                                        {
                                            stack: [
                                                {
                                                    text: "Course Author",
                                                },
                                                {
                                                    text: options.author,
                                                    style: "boldFooter"
                                                }
                                            ],
                                            alignment: 'right',
                                            margin: [30, 0]
                                        }
                                    ],
                                    margin: [0, 120, 0, 0]
                                }
                            ]
                        }]
                    ]
                },
                layout: "noBorders"
            },

        ],
        styles: {

            cursive: {
                fontSize: 32,
                margin: [0, 120, 0, 20],
                alignment: "center",
                font: "Sacramento"
            },
            awardee: {
                fontSize: 14,
                alignment: "center",
                font: "Poppins"
            },
            name: {
                fontSize: 36,
                alignment: "center",
                bold: true,
                margin: [0, 30, 0, 30],
                font: "JosefinSans"
            },
            course: {
                fontSize: 16,
                alignment: "center",
                margin: [120, 0],
                color: "#897575"

            },
            boldFooter: {
                fontSize: 14,
                bold: true,
                margin: [0, 10]
            }
        },
        defaultStyle: {
            font: "Poppins"
        }

    }
}