const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const rootDir = require('./util/path');
const { get404 } = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(path.resolve(rootDir, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  User.findById(1)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => {
      console.error(err);
      next();
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(get404);

const PORT = 3000;

Product.belongsTo(User, {
  constraints: true,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User, {
  constraints: true,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
User.hasMany(Order);
Order.belongsTo(User, {
  constraints: true,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });

sequelize
  .sync({ force: false })
  // .then(() => {
  //   return User.findById(1);
  // })
  // .then(user => {
  //   if (!user) {
  //     return User.create({ name: 'test', email: 'test@test.com' });
  //   } else {
  //     return user;
  //   }
  // })
  // .then(user => {
  //   return user.createCart();
  // })
  .then(() => {
    app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
  })
  .catch(err => console.error(err));
