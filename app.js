var request = require('request');
var axios = require('axios');
var prompt = require('prompt');
var logic = require('./functions.js');
var menus = require('./menus.js');
var _ = require('lodash');

var transactions = [];

prompt.start();
console.log("Starting program!");
console.log("Grabbing all transactions....");

logic.getTransactionsTotalCount().then(function(transactionCount) {
  return logic.getTransactionPagesByCount(transactionCount);
}).then(function(transactionsByPage) {
  transactionsDirty = _.flatten(transactionsByPage);
  return logic.cleanCompanyNamesInTransactions(transactionsDirty);
}).then(function(transactionsClean) {
  menus.showMainMenu(transactionsClean);
}).catch(function(err){
  console.log(err);
});
