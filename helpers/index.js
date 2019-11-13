var rand = function () {
  return Math.random()
    .toString(36)
    .substr(2); // remove `0.`
};

exports.token = function () {
  return rand() + rand(); // to make it longer
};

exports.is_empty = (object) => { return !Object.keys(object).length > 0 }
