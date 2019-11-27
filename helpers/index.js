const fs = require('fs');

var rand = function () {
  return Math.random()
    .toString(36)
    .substr(2); // remove `0.`
};

exports.token = function () {
  return rand() + rand(); // to make it longer
};

exports.is_empty = (object) => { return !Object.keys(object).length > 0 }

exports.tagOptions = () => {
  let tagsHTML = '';
  let tags = require('../config/tags.json');
  tags.forEach((value, index) => {
    tagsHTML += `<option value = "${value.tagName}">${value.tagName}</option>`;
  });

  return tagsHTML;
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
  console.log('count', count)
  let total = 30
  let percent = (count / total) * 100
  return percent.toFixed(2);
}