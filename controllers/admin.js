const _ = require('lodash');

const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;
  Product.create({ title, imageUrl, price, description })
    .then(() => {
      res.redirect('/');
    })
    .catch(err => console.error(err));
};

exports.postEditProduct = (req, res, next) => {
  const { productId, title, imageUrl, price, description } = req.body;
  Product.update(
    { title, imageUrl, description, price },
    { where: { id: productId } }
  )
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch(err => console.error(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const { productId } = req.body;
  Product.destroy({ where: { id: productId } })
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch(err => console.error(err));
};

exports.getEditProduct = (req, res, next) => {
  const { productId } = req.params;
  const editing =
    !_.isNil(req.query.edit) && req.query.edit.toLowerCase() === 'true';
  if (!editing) {
    return res.redirect('/');
  }
  Product.findById(productId)
    .then(product => {
      if (_.isNil(product)) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing,
        product
      });
    })
    .catch(err => console.error(err));
};

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => console.error(err));
};
