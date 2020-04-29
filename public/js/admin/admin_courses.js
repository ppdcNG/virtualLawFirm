$('a[href="#courses"]').on('shown.bs.tab', ((e) => {
    setTimeout(() => {
        $("#loadingCourses").css('display', 'none');
        $('#course').css('display', 'block');
    }, 1500)
}))

