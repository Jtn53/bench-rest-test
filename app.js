var prompt = require('prompt');
var logic = require('./functions.js');
var menus = require('./menus.js');

prompt.start();
console.log("Starting program!");

// grab all the transactions, then display to user
logic.getAllTransactions().then((transactions) => {
  menus.navigateToMenu(0, transactions);
}).catch((err) => {
  console.log(err);
});
