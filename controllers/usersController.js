var database = require('./database');
const {google} = require('googleapis');

database.initDatabase(getAllUserIds);

function getAllUserIds() {
  database.getAllUserIds(function (result) {
    console.log('all user ids:');
    console.log(result);
  });
}

module.exports = {
  getAllUserIds: getAllUserIds
};