const fs = require('fs');
const admin = require('firebase-admin');

var rand = function () {
  return Math.random()
    .toString(36)
    .substr(2); // remove `0.`
};

exports.token = function () {
  return rand() + rand(); // to make it longer
};

var is_empty = (object) => { return !Object.keys(object).length > 0 }
exports.is_empty = is_empty;

exports.tagOptions = () => {
  let tagsHTML = '';
  let tags = require('../config/tags.json');
  tags.forEach((value, index) => {
    tagsHTML += `<option value = "${value.tagName}">${value.tagName}</option>`;
  });

  return tagsHTML;
}

exports.lawyerOptions = async () => {
  lawyersHTML = "";
  let lawyers = await admin.firestore().collection('lawyerNames').get().catch((e) => { console.log(e) });

  lawyers.forEach((lawyer) => {
    lawyersHTML += `<option value = "${lawyer.id}">${lawyer.data().name}</option>`
  })
  return lawyersHTML;
}


const numberOfFields = (obj) => {
  let count = 0;
  for (let key in obj) {
    if (typeof obj[key] === 'object') {
      count += numberOfFields(obj[key])
    }
    else {
      count += 1;
    }
  }
  return count;
}

exports.percentageComplete = (obj) => {
  let count = numberOfFields(obj);
  let userFields = require('../helpers/user.json');
  let total = numberOfFields(userFields);
  console.log('count', count)
  let percent = (count / total) * 100
  percent = percent > 100 ? 100 : percent;
  return percent.toFixed(0);
}

exports.renderDocuments = docs => {
  var html = "";
  if (docs == undefined || is_empty(docs)) {
    return `<li class="list-group-item">No Documents</li>`;
  }
  for (var i in docs) {
    html += renderDocument(docs[i]);
  }
  return html;
}

const renderDocument = doc => {
  return `
      <li class="list-group-item mr-2">
        <div class="md-v-line">
          <i class="fas fa-file-alt mr-1 pr-1"></i>
          <a href="${doc.url}" target="_blank">${doc.title} <i class="fas fa-angle-double-right"></i></a>
        </div>
      </li>
    `
}

exports.copyLawyers = async () => {
  let batch = admin.firestore().batch();
  let lawyers = await admin.firestore().collection('lawyers').get();
  lawyers.forEach((lawyer) => {
    let docref = admin.firestore().collection('lawyerNames').doc(lawyer.id);
    let { name, authId } = lawyer.data();
    batch.set(docref, { name, authId });
  });
  await batch.commit();
  console.log('successfully written');
}

// categories helper function() 
exports.familyLawOptions = () => {
  let tagsHTML = '';
  let tags = require('../config/categories/family-law.json');
  tags.slice([0], [10]).forEach((value, index) => {
    tagsHTML += `<option value = "${value["family law"]}" selected>${value["family law"]}</option>`;
  });

  return tagsHTML;
}

exports.administrativePublicLawOptions = () => {
  let tagsHTML = '';
  let tags = require('../config/categories/administrative-public-law.json');
  tags.slice([0], [10]).forEach((value, index) => {
    tagsHTML += `<option value = "${value["administrative public law"]}" selected>${value["administrative public law"]}</option>`;
  });

  return tagsHTML;
}

exports.landPropertyLawOptions = () => {
  let tagsHTML = "";
  let tags = require('../config/categories/land-property-law.json');
  tags.slice([0], [10]).forEach((value, index) => {
    tagsHTML += `<option value = "${value["land/property law"]}" selected>${value["land/property law"]}</option>`;
  })
  return tagsHTML;
}

exports.financeCommercialLawOptions = () => {
  let tagsHTML = "";
  let tags = require('../config/categories/finance-commercial-law.json');
  tags.slice([0], [10]).forEach((value, index) => {
    tagsHTML += `<option value = "${value["finance/commercial law"]}" selected>${value["finance/commercial law"]}</option>`;
  })
  return tagsHTML;
}

exports.digitalEntertainmentLawOptions = () => {
  let tagsHTML = "";
  let tags = require('../config/categories/digital-ent-sports.json');
  tags.slice([0], [10]).forEach((value, index) => {
    tagsHTML += `<option value = "${value["digital/ip law/entertainment/sports"]}" selected>${value["digital/ip law/entertainment/sports"]}</option>`;
  })
  return tagsHTML;
}

exports.energyProjectsLawOptions = () => {
  let tagsHTML = "";
  let tags = require('../config/categories/energy-projects.json');
  tags.slice([0], [10]).forEach((value, index) => {
    tagsHTML += `<option value = "${value["energy/projects"]}" selected>${value["energy/projects"]}</option>`;
  })
  return tagsHTML;
}

exports.othersOptions = () => {
  let tagsHTML = "";
  let tags = require('../config/categories/others.json');
  tags.slice([0], [10]).forEach((value, index) => {
    tagsHTML += `<option value = "${value.others}" selected>${value.others}</option>`;
  })
  return tagsHTML;
}

