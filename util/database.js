const Sequelize = require('sequelize');

const sequelize = new Sequelize('node_complete', 'root', 'root', {
  host: 'localhost',
  port: 3306,
  dialect: 'mysql'
});

module.exports = sequelize;
