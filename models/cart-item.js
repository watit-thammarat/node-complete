const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const CartItem = sequelize.define('cartItem', {
  quantity: Sequelize.INTEGER
});

module.exports = CartItem;
