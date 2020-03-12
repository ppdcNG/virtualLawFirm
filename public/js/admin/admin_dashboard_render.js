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
    <td>
      <button class="btn btn-default" data-toggle = "tooltip" title = "View Case Details"  onclick = "viewCase('${taskId}')" ><i class="far fa-eye"></i></button>
      <button class="btn" data-toggle="tooltip" onclick = "sheduleMetting('${taskId}') title = "View Scheduled Meetings"><i class="far fa-calendar-alt"></i></button>
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
