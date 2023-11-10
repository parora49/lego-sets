const setData = require("../data/setData");
const themeData = require("../data/themeData");

let sets = [];

const initialize = () => {
  return new Promise((resolve, reject) => {
    let _sets = setData.map((item) => {
      let theme = themeData.find((x) => x.id === item.theme_id)?.name;
      return {
        ...item,
        theme,
      };
    });
    sets = _sets;

    resolve();
  });
};

const getAllSets = () => {
  return new Promise((resolve, reject) => {
    if (sets.length > 0) {
      resolve(sets);
    } else {
      reject("not found");
    }
  });
};

const getSetByNum = (setNum) => {
  return new Promise((resolve, reject) => {
    let set = sets.find((item) => item.set_num === setNum);
    if (set) {
      resolve(set);
    } else {
      reject("Unable to find requested set");
    }
  });
};

const getSetsByTheme = (theme) => {
  return new Promise((resolve, reject) => {
    theme = theme.toLowerCase();
    let _sets = sets.filter((item) => item.theme.toLowerCase() === theme);
    if (_sets.length > 0) resolve(_sets);
    else reject("Unable to find requested sets");
  });
};

module.exports = {
  initialize,
  getAllSets,
  getSetByNum,
  getSetsByTheme,
};
