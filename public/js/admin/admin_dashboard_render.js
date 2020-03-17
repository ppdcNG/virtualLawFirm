const renderLawyers = (lawyers) => {
    // lawyers = [{ fullname, status, id.....}...]
}

const renderCases = (task, taskId) => {
    let formattedTimestamp = Math.abs(task.timestamp);
    let time = moment(formattedTimestamp).format("dddd, MMMM Do YYYY");
    return `<tr>
    <td>${task.subject || "N/A"}</td>
    <td>${task.client.displayName}</td>
    <th>${task.status || "N/A"}</th>
    <td>${task.lawyer.name || "N/A"}</td>
    <td>${time}</td>
    <td class="d-flex justify-content-center">
      <button class="btn btn-default" data-toggle = "tooltip" title = "View Case Details" data-toggle="modal" data-target="#taskDetailsModal"  onclick = "viewCase('${taskId}')" ><i class="far fa-eye"></i></button>
      <button class="btn btn-default" data-toggle ="tooltip" title="Contact" onclick="contactModal()"><i class="fas fa-paper-plane"></i></button>
      <button class="btn" data-toggle="tooltip" title="History" onclick="historyModal()"><i class="far fa-file"></i></button>
    </td>
</tr>`;
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

// const viewCase = id => {
//     $("#taskDetailsModal").modal('show');
// }
const contactModal = () => {
    $("#contactModal").modal('show');
}
const historyModal = () => {
    $("#historyModal").modal('show');
}

const renderTableLoading = () => {
    return ``
}


