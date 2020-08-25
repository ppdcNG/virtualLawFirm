let uid = $("#uid").val();
let usertype = $("#userType").val();
console.log(uid);
let coursesCollection = firebase.firestore().collection(`${usertype}s/${uid}/courseList`);
let COURSES = {};

$(document).ready(function () {
    fetchCourses();
});

$("#searchCourse").change(function (e) {
    buttonLoad('courses')
    let id = $(this).val();
    let HTML = "";
    if (id == 0) {
        Object.keys(COURSES).map((key) => {
            console.log(key)
            let course = COURSES[key];
            HTML += renderCourse(course, key)
        })
    }
    else {
        console.log(id);
        let course = COURSES[id]
        HTML = renderCourse(course, id);
    }
    clearLoad('courses', '');
    console.log(HTML)
    $("#courses").html(HTML);
    AOS.init();
});

const renderCourse = (course, id) => {
    let description = course.title ? (course.title.length > 45 ? course.title.substr(0, 21) + '...' : course.title) : "No Title";
    let price = course.price > 0 ? "&#8358; " + accounting.format(parseInt(course.price)) : 'FREE';
    let rating = course.rating ? course.rating : 'No rating yet'
    let author = course.author ? course.author : '';
    let progress = "Not started";
    if (course.progress) {
        progress = parseInt(course.progress) >= 100 ? "100% Done" : course.progress + "%";
    }



    return `
            <div class="col-md-4 mb-4">
                <div class="card h-100 shadow mt-1" data-aos="zoom-out" data-aos-duration="400">
                    <div class="view overlay">
                        <img class="card-img-top" src="${course.courseImage}"
                            alt="html_css_image"  height = "160">
                    </div>

                    <div class="card-body d-flex flex-column">
                        <h4 class="card-title ml-2" data-toggle = "tooltip" title = "${course.description || course.title}" >${course.title}</h4>
                        <p class = "author ml-2">By : ${author}</p>
                        <p class = "author ml-2">Progress : ${progress}</p>
                        <a href = "/e-learning/courseDetails?id=${id}"  class = "btn lt-btn-accent">Go to Course</a>
                    </div>
                </div>
            </div>
            `

}


const fetchCourses = async () => {
    console.log("fetching")
    let courses = await coursesCollection.limit(30).get();
    let coursesHTML = "";
    let count = 0;
    courses.forEach((snapshot) => {
        let course = snapshot.data();
        console.log(course);
        COURSES[snapshot.id] = course;
        coursesHTML += renderCourse(course, snapshot.id);
        count++
    });
    if (is_empty(coursesHTML)) coursesHTML = renderNocourse();
    $("#courses").html(coursesHTML);
    AOS.init();

}
const renderNocourse = () => {
    return `<div class="col-md-4 mb-4">
                <div class="card h-100 shadow mt-1" data-aos="zoom-out" data-aos-duration="400">

                    <div class="card-body d-flex flex-column">
                        <h4 class="card-title" data-toggle = "tooltip" title = "Not enrolled" >You are not Enrolled in any course yet</h4>
                        <p>Browse List of courses to enroll</p>
                        <a href = "/e-learning/" class = "btn lt-btn-accent">Browse Courses</a>
                    </div>
                </div>
            </div>`
}

const renderCategories = (categories) => {
    let coursesHTML = "";
    categories.forEach((value) => {
        coursesHTML += renderCourse(value, value.id);
    })

    $("#categories").html(coursesHTML);
    AOS.init();
}

const renderCategoriesTab = (id) => {
    let tabHTML = "";
    let categoryList = Object.keys(CATEGORIES);
    categoryList.forEach((key, i) => {
        let active = i == id ? "active" : ""
        tabHTML += `<div onclick = "categoryTab('${i}')" class = "col-md-3 course-category d-flex flex-row justify-contentcenter"><span class = "category-item ${active}">${key}</span></div>`
    });

    $("#categoriesTab").html(tabHTML);
    let category = CATEGORIES[categoryList[id]];
    renderCategories(category);
}

const categoryTab = id => {
    console.log(id, "category")
    id = parseInt(id);
    renderCategoriesTab(id);
}

