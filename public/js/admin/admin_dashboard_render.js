

const renderLawyers = (lawyers) => {
    // lawyers = [{ fullname, status, id.....}...]
}

const renderCases = (cases) => {

}

const renderTable = (data) => {
    return `
        <tr>
            <th scope="row">1</th>
            <td>${data.fullName}</td>
            <td>${data.status}</td>
            <td>
                <a onclick="" class="btn btn-sm text-dark" data-toggle="modal" data-target="#detailsModal">View</a>
            </td>
          </tr>
        `
}
