const fs = require('fs');
const path = require('path');

const _ = require('lodash');

const rootDir = require('../util/path');

const filePath = path.resolve(rootDir, 'data', 'cart.json');

module.exports = class Cart {
  static addProduct(id, price) {
    let cart = { products: [], totalPrice: 0 };
    fs.readFile(filePath, (err, content) => {
      if (!err && !_.isNil(content)) {
        cart = JSON.parse(content);
      }
      let updatedProduct;
      const index = cart.products.findIndex(p => p.id === id);
      if (index > -1) {
        updatedProduct = cart.products[index];
        updatedProduct.qty = +updatedProduct.qty + 1;
      } else {
        updatedProduct = { id, qty: 1 };
        cart.products.push(updatedProduct);
      }
      cart.totalPrice = +cart.totalPrice + +price;
      fs.writeFile(filePath, JSON.stringify(cart), err => {
        console.log(err);
      });
    });
  }

  static deleteProduct(id, price) {
    fs.readFile(filePath, (err, content) => {
      if (err || _.isNil(content)) {
        return;
      }
      const cart = JSON.parse(content);
      const product = cart.products.find(p => p.id === id);
      if (_.isNil(product)) {
        return;
      }
      cart.totalPrice = +cart.totalPrice - +price * +product.qty;
      cart.products = cart.products.filter(p => p.id !== id);
      fs.writeFile(filePath, JSON.stringify(cart), err => {
        if (err) {
          console.log(err);
        }
      });
    });
  }

  static getCart(cb) {
    fs.readFile(filePath, (err, content) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err && !_.isNil(content)) {
        cart = JSON.parse(content);
      }
      cb(cart);
    });
  }
};
