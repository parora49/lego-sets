require("dotenv").config();
const Sequelize = require("sequelize");

let sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  }
);

// models
const Theme = sequelize.define("Theme", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: Sequelize.STRING,
});

const Set = sequelize.define("Set", {
  set_num: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  year: Sequelize.INTEGER,
  num_parts: Sequelize.INTEGER,
  theme_id: Sequelize.INTEGER, // Foreign key linking to Theme
  img_url: Sequelize.STRING,
});

// Association
Set.belongsTo(Theme, { foreignKey: "theme_id" });

const initialize = () => {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(async () => {
        resolve();
      })
      .catch((err) => {
        reject("Unable to connect to the database:", err);
      });
  });
};

const getAllSets = () => {
  return new Promise((resolve, reject) => {
    Set.findAll({
      include: [Theme],
    })
      .then((sets) => {
        if (sets.length > 0) {
          resolve(sets);
        } else {
          reject("not found");
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getSetByNum = (setNum) => {
  return new Promise((resolve, reject) => {
    Set.findOne({ where: { set_num: setNum }, include: [Theme] })
      .then((set) => {
        if (set) {
          resolve(set);
        } else {
          reject("unable to find requested set");
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getSetsByTheme = (theme) => {
  return new Promise((resolve, reject) => {
    Set.findAll({
      include: [Theme],
      where: {
        "$Theme.name$": {
          [Sequelize.Op.iLike]: `%${theme}%`,
        },
      },
    })
      .then((sets) => {
        if (sets.length > 0) resolve(sets);
        else reject("unable to find requested sets");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getAllThemes = () => {
  return new Promise((resolve, reject) => {
    Theme.findAll()
      .then((themes) => {
        if (themes.length > 0) {
          resolve(themes);
        } else {
          reject("not found");
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const addSet = (setData) => {
  return new Promise((resolve, reject) => {
    Set.create(setData)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
};

const editSet = (setNum, setData) => {
  return new Promise((resolve, reject) => {
    Set.update(setData, { where: { set_num: setNum } })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
};

const deleteSet = (setNum) => {
  return new Promise((resolve, reject) => {
    Set.destroy({ where: { set_num: setNum } })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
};

module.exports = {
  initialize,
  getAllSets,
  getSetByNum,
  getSetsByTheme,
  getAllThemes,
  addSet,
  editSet,
  deleteSet,
};
