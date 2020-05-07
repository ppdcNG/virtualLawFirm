var COURSES = {};

let courseStoragePath = 'courses/'

$(document).ready(() => {
    fetchCourses();
    $('#addCourseForm').submit(function (e) {
        e.preventDefault();
        let course = form2js('addCourseForm', '.', false);
        let mode = $("#courseMode").val();
        mode == 'add' ? addCourse(course) : editCourse(course);
    });

    $('#addCourseButton').click(function () {
        $("#courseMode").val("add");
        $("#courseModal").modal('show');
    })
    $("#submitCourseFormButton").click(() => { $("#addCourseForm").submit() });

})



const fetchCourses = async () => {
    let coursesHtml = "";
    let coursesSnapshot = await firebase.firestore().collection('courses').get().catch((e) => { console.log(e) });
    coursesSnapshot.forEach((course) => {
        let coursedata = course.data();
        console.log(coursedata)
        coursesHtml += renderCourse(coursedata, course.id);
        COURSES[course.id] = coursedata;
    })

    $("#coursesList").html(coursesHtml);
    $("#loadingCourses").fadeOut(800);
    $("#coursesList").fadeIn(1500);

}


const addCourse = async course => {
    buttonLoad('submitCourseFormButton');
    let file = $("#courseImage")[0].files[0];
    if (!file) {
        $.notify('Course Image not Selected', { type: 'danger', delay: 2500 });
        return;
    }
    let dbRef = firebase.firestore().collection('courses').doc();
    let notification = $.notify('Uploading Course Image', { type: 'info', delay: 0 });
    let filePath = courseStoragePath + 'banner/' + dbRef.id;
    let uploadTask = await firebase.storage().ref(filePath).put(file);
    let url = await uploadTask.ref.getDownloadURL();
    notification.update('message', 'Adding Course...');
    course = form2js('addCourseForm', '.', false);
    course.courseImage = url;
    course.dateAdded = 0 - new Date().getTime();
    try {
        await dbRef.set(course);
        notification.close();
        $.notify('Course Added Succesfully', { type: 'success', delay: 2500 });
        $("#addCourseForm")[0].reset();
        $("#tags").trigger('change');
        clearLoad('submitCourseFormButton', 'Add Course');
        $("#courseModal").modal('hide');

    }
    catch (e) {
        console.log(e)
        notification.close();
        $.notify('OOps an error occured', { type: 'danger', delay: 2500 });
    }

}

const editCourse = async  course => {
    buttonLoad('submitCourseFormButton');
    let id = $("#courseId").val();
    let dbRef = firebase.firestore().collection('courses').doc(id);
    let file = $("#courseImage")[0].files[0];
    let notification = $.notify('Please Wait...', { type: 'info', delay: 0 });
    if (file) {
        notification.update('message', 'Replacing course Image...')
        let filePath = courseStoragePath + 'banner/' + dbRef.id;
        let uploadTask = await firebase.storage().ref(filePath).put(file);
        let url = await uploadTask.ref.getDownloadURL();
        course.courseImage = url;
    }

    try {
        await dbRef.update(course);
        notification.close();
        $.notify('Course Edited Succesfully', { type: 'success', delay: 2500 });
        $("#addCourseForm")[0].reset();
        $("#tags").trigger('change');
        clearLoad('submitCourseFormButton', 'Add Course');
        $("#courseModal").modal('hide');

    }
    catch (e) {
        console.log(e)
        notification.close();
        $.notify('OOps an error occured', { type: 'danger', delay: 2500 });
    }
}

const editCourseButton = id => {
    console.log(id);
    let course = COURSES[id];
    js2form('addCourseForm', course);
    $("#courseId").val(id);
    $("#courseMode").val('edit');
    $("#courseModal").modal('show');
    $("#addCourseForm input").trigger('change');
    $("#addCourseForm textarea").trigger('change');
    $("#tags").trigger('change');


}


const renderCourse = (course, courseId) => {
    let title = course.title ? (course.title.length > 45 ? course.title.substr(0, 20) + '...' : course.title) : "No Description"
    return `
    <div class="col-md-4 mb-3 ">
        <div class="card mt-1 h-100">
            <div class="view overlay">
                <img class="card-img-top" src="${course.courseImage}"
                    alt="html_css_image" width = "300" height = "300">
                <a href="#!">
                    <div class="mask rgba-white-slight"></div>
                </a>
            </div>

            <div class="card-body">
                <h3 class="card-title" data-toggle = "tooltip" title = "${course.title}">${title}</h3>
                <p class="card-text"></p>

                <div class="row">
                    <div class="col">
                        <a class="btn btn-info" onclick = "editCourseButton('${courseId}')">Edit</a>
                    </div>
                    <div class="col">
                        <a class="btn btn-primary" href="/admin/editCourseDetails?id=${courseId}">View</a>
                    </div>
                </div>

            </div>
        </div>
    </div>
    
    `
}

