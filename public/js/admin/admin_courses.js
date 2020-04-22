$('a[href="#courses"]').on('shown.bs.tab', ((e) => {
    setTimeout(() => {
        $("#loadingCourses").css('display', 'none');
        $('#course').css('visibility', 'visible');
    }, 1500)
}))

