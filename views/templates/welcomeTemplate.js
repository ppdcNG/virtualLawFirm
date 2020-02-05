exports.welcomeTemplate = options => {
  return `
    <html>
        <body>
        <div style = "text-align: center;">
        <h3>Welcome to A&E Law</h3>
        <p>Please answer the following question:</p>
        <p>${options.name}</p>
        <div>
        <a href = "${options.ABS}${options.link}">${options.link}</a>
        </div>
        <div> <a href="${options.link}">No</a>
        </div>
        </body>
    </html>
    `;
};
