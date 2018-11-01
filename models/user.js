const mongoDb = require('mongodb');
const _ = require('lodash');

const { getDb } = require('../util/database');

class User {
  constructor(name, email, cart, id = null) {
    this.name = name;
    this.email = email;
    this.cart = cart;
    if (id) {
      this._id = mongoDb.ObjectId(id);
    }
  }

  save() {
    const db = getDb();
    let dbOps;
    if (this._id) {
      dbOps = db
        .collection('users')
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      dbOps = db.collection('users').insertOne(this);
    }
    return dbOps
      .then(result => {
        return result;
      })
      .catch(err => console.error(err));
  }

  addToCart(product) {
    const index = this.cart.items.findIndex(
      i => i.productId.toString() == product._id.toString()
    );
    const items = [...this.cart.items];
    if (index > -1) {
      items[index].quantity = this.cart.items[index].quantity + 1;
    } else {
      items.push({ productId: product._id, quantity: 1 });
    }
    const cart = { items };
    const db = getDb();
    return db
      .collection('users')
      .updateOne({ _id: this._id }, { $set: { cart } });
  }

  getCart() {
    const db = getDb();
    const ids = this.cart.items.map(i => i.productId);
    return db
      .collection('products')
      .find({ _id: { $in: ids } })
      .toArray()
      .then(products => {
        return products.map(p => {
          return {
            ...p,
            quantity: this.cart.items.find(
              i => i.productId.toString() === p._id.toString()
            ).quantity
          };
        });
      })
      .catch(err => console.error(err));
  }

  deleteItemFromCart(id) {
    const db = getDb();
    const items = this.cart.items.filter(
      i => i.productId.toString() !== id.toString()
    );
    const cart = { items };
    return db
      .collection('users')
      .updateOne({ _id: this._id }, { $set: { cart } });
  }

  addOrder() {
    const db = getDb();
    return this.getCart()
      .then(products => {
        const order = {
          items: products,
          user: { _id: this._id, name: this.name }
        };
        return db.collection('orders').insertOne(order);
      })
      .then(result => {
        this.cart = { items: [] };
        return db
          .collection('users')
          .updateOne({ _id: this._id }, { $set: { cart: this.cart } });
      })
      .catch(err => console.error(err));
  }

  getOrders() {
    const db = getDb();
    return db
      .collection('orders')
      .find({ 'user._id': this._id })
      .toArray();
  }

  static findById(id) {
    const db = getDb();
    return db
      .collection('users')
      .findOne({ _id: new mongoDb.ObjectId(id) })
      .then(user => {
        console.log(user);
        return user;
      })
      .catch(err => console.error(err));
  }
}

module.exports = User;
