const _ = require('lodash');

const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => console.error(err));
};

exports.getProduct = (req, res, next) => {
  const { productId } = req.params;
  Product.findById(productId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.error(err));
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => console.error(err));
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(({ cart }) => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: cart.items
      });
    })
    .catch(err => console.error(err));
};

exports.postCart = (req, res, next) => {
  const { productId } = req.body;
  Product.findById(productId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => console.error(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const { productId } = req.body;
  req.user
    .removeFromCart(productId)
    .then(() => res.redirect('/cart'))
    .catch(err => console.error(err));
};

// exports.getChecktout = (req, res, next) => {
//   res.render('shop/checkout', {
//     path: '/checkout',
//     pageTitle: 'Checkout'
//   });
// };

exports.getOrders = (req, res, next) => {
  Order.find({ 'user._id': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders
      });
    })
    .catch(err => console.error(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(({ cart }) => {
      const { _id, name } = req.user;
      const products = cart.items.map(i => ({
        quantity: i.quantity,
        product: { ...i.productId._doc }
      }));
      const order = new Order({
        user: { _id, name },
        products
      });
      return order.save();
    })
    .then(() => {
      return req.user.clearCart();
    })
    .then(() => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders
      });
      res.redirect('/orders');
    })
    .catch(err => console.error(err));
};
