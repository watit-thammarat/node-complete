const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const rootDir = require('./util/path');
const { get404 } = require('./controllers/error');
const { mongoConnect } = require('./util/database');
const User = require('./models/user');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(path.resolve(rootDir, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  User.findById('5bdae4bce2fe18c804bc87ec')
    .then(user => {
      req.user = new User(user.name, user.email, user.cart, user._id);
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

mongoConnect(() => {
  app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
});
