$(function () {
    $(document).on("click", "a[href-post]", (e) => {
        e.preventDefault();

        const form = document.createElement("form");
        form.style.display = "none";
        form.method = "post";
        form.action = $(e.currentTarget).attr("href-post")!;
        form.target = "_self";
        document.body.appendChild(form);
        form.submit();
    });
    $(document).on("keydown", "a[href-post]", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            $(e.currentTarget).trigger("click");
        }
    });
});
