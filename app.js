import prompt from 'prompt';
import * as logic from './functions.js';
import * as menus from './menus.js';

prompt.start();
console.log("Starting program!");

// grab all the transactions, then display to user
logic.getAllTransactions().then((transactions) => {
  menus.navigateToMenu(0, transactions);
}).catch((err) => {
  console.log(err);
});
