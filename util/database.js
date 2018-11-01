const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = cb => {
  MongoClient.connect(
    'mongodb+srv://tongnakub:abcd1234@cluster0-elfws.mongodb.net/shop?retryWrites=true'
  )
    .then(client => {
      console.log('Connected!');
      _db = client.db();
      cb(client);
    })
    .catch(err => {
      console.error(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw Error('No database found!');
};

module.exports = {
  mongoConnect,
  getDb
};
