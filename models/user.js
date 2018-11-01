const mongoose = require('mongoose');

// const Product = require('./product');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          required: true
        }
      }
    ]
  }
});

// UserSchema.methods.getCart = function() {
//   const ids = this.cart.items.map(i => i.productId);
//   return Product.find({ _id: ids })
//     .then(products => {
//       return products.map(p => {
//         return {
//           ...p.toObject(),
//           quantity: this.cart.items.find(
//             i => i.productId.toString() === p._id.toString()
//           ).quantity
//         };
//       });
//     })
//     .catch(err => console.error(err));
// };

UserSchema.methods.removeFromCart = function(id) {
  const items = this.cart.items.filter(i => {
    return i._id.toString() !== id.toString();
  });
  this.cart = { ...this.cart, items };
  return this.save();
};

UserSchema.methods.addToCart = function(product) {
  const index = this.cart.items.findIndex(
    i => i.productId.toString() == product._id.toString()
  );
  const items = [...this.cart.items];
  if (index > -1) {
    items[index].quantity = this.cart.items[index].quantity + 1;
  } else {
    items.push({ productId: product._id, quantity: 1 });
  }
  this.cart = { ...this.cart, items };
  return this.save();
};

UserSchema.methods.clearCart = function() {
  this.cart = { items: [] };
  return this.save();
};

module.exports = mongoose.model('User', UserSchema);

