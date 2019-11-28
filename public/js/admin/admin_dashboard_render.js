const renderLawyers = (lawyers) => {
    // lawyers = [{ fullname, status, id.....}...]
}

const renderCases = (cases) => {

}

const renderTable = (i, lawyer) => {
    return `
        <tr>
            <th scope="row">${Object.keys(lawyers).indexOf(i) + 1}</th>
            <td>${lawyer.name}</td>
            <td>${lawyer.status ? lawyer.status : 'N/A'}</td>
            <td>
                <a onclick="viewSummary('${i}')" class="btn btn-sm text-dark" data-toggle="modal" data-target="#detailsModal">View</a>
            </td>
          </tr>
        `
}