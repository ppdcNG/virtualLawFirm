$("#filter").keyup(function () {
    let filter = $(this).val(),
        count = 0;

    $('#notary-cards div').each(function () {
        if ($(this).text().search(new RegExp(filter, "i")) < 0) {
            $(this).hide();
        } else {
            $(this).show();
            count++;
        }
    });
});