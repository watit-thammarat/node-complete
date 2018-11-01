const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const rootDir = require('./util/path');
const { get404 } = require('./controllers/error');
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
  User.findById('5bdb13d360b79410106b9402')
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

mongoose
  .connect(
    'mongodb+srv://tongnakub:abcd1234@cluster0-elfws.mongodb.net/shop?retryWrites=true'
  )
  // .then(() => {
  //   const user = new User({
  //     name: 'test',
  //     email: 'test@test.com',
  //     cart: { items: [] }
  //   });
  //   return user.save();
  // })
  .then(() => {
    app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
  })
  .catch(err => console.error(er));
