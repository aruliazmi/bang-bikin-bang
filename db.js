require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  dialect: 'mysql',
  logging: false
});

const PlayerUCP = sequelize.define('playerucp', {
  ucp: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  verifycode: {
    type: DataTypes.STRING(5),
    allowNull: false
  },
  DiscordID: {
    type: DataTypes.STRING,
    allowNull: false
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  createdAt: 'reg_date',
  updatedAt: false,
  tableName: 'playerucp'
});

sequelize.sync();

module.exports = { sequelize, PlayerUCP };
