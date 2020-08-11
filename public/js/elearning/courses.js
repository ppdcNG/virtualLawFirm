
let coursesCollection = firebase.firestore().collection('courses');
let CATEGORIES = {};
let COURSES = {};
let searchdata = [{ id: 0, text: "All courses" }];

$(document).ready(function () {
    fetchCourses()
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
    let oldprice = course.oldprice ? `<span class = "oldprice text-danger"><del>&#8358;${accounting.format(parseInt(course.oldprice))}</del></span>` : "";

    return `
            <div class="col-md-3 mb-4">
                <div class="card h-100 shadow mt-1" data-aos="zoom-out" data-aos-duration="400">
                    <div class="view overlay">
                        <img class="card-img-top" src="${course.courseImage}"
                            alt="html_css_image"  height = "160">
                        <a onclick="viewCourse('${id}')" href = "/e-learning/courseDetails?id=${id}">
                            <div class="mask rgba-white-slight"></div>
                        </a>
                    </div>

                    <div class="card-body d-flex flex-column">
                        <h4 class="card-title" data-toggle = "tooltip" title = "${course.description || course.title}" >${course.title}</h4>
                        <p class = "author">By:${course.author}</p>
                        <p><strong>Price:</strong><span class = "price text-muted mx-2">${price}<span> ${oldprice}</p>
                        <a href = "/e-learning/courseDetails?id=${id}"  class = "btn lt-btn-accent">View Course</a>
                    </div>
                </div>
            </div>
            `

}


const fetchCourses = async () => {
    let courses = await coursesCollection.orderBy('dateAdded').limit(30).get();
    let coursesHTML = "";
    let count = 0;
    courses.forEach((snapshot) => {
        let course = snapshot.data();
        console.log(course);
        searchdata.push({
            id: snapshot.id,
            text: course.title
        })
        COURSES[snapshot.id] = course;
        coursesHTML += renderCourse(course, snapshot.id);
        if (course.category) {
            if (CATEGORIES[course.category]) CATEGORIES[course.category].push(course);
            else {
                course.id = snapshot.id;
                CATEGORIES[course.category] = [course];
            }
        }
        count++
    });

    $("#searchCourse").select2({
        data: searchdata,
        theme: 'bootstrap',
        placeholder: "Search Courses"
    })
    $("#courses").html(coursesHTML);
    AOS.init();
    renderCategoriesTab(0);

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


