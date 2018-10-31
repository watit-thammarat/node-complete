const _ = require('lodash');

const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  Product.findAll()
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
  Product.findAll()
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
    .getCart()
    .then(cart => {
      return cart.getProducts();
    })
    .then(products => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products
      });
    })
    .catch(err => console.error(err));
};

exports.postCart = (req, res, next) => {
  const { productId } = req.body;
  req.user
    .getCart()
    .then(cart => {
      return cart
        .getProducts({ where: { id: productId } })
        .then(products => {
          if (_.isEmpty(products)) {
            return Product.findById(productId).then(product => {
              return { product, quantity: 1 };
            });
          } else {
            const product = products[0];
            const quantity = product.cartItem.quantity + 1;
            return { product, quantity };
          }
        })
        .then(({ product, quantity }) => {
          return cart.addProduct(product, { through: { quantity } });
        });
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => console.error(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const { productId } = req.body;
  req.user
    .getCart()
    .then(cart => {
      return cart.getProducts({ where: { id: productId } });
    })
    .then(products => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then(() => res.redirect('/cart'))
    .catch(err => console.error(err));
};

exports.getChecktout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders({
      include: [{ model: Product }]
    })
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
    .getCart()
    .then(cart => {
      return cart.getProducts().then(products => {
        return req.user
          .createOrder()
          .then(order => {
            return order.addProducts(
              products.map(p => {
                p.orderItem = { quantity: p.cartItem.quantity };
                return p;
              })
            );
          })
          .then(() => {
            return cart.setProducts(null);
          });
      });
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => console.error(err));
};
