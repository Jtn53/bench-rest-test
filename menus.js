var request = require('request');
var axios = require('axios');
var prompt = require('prompt');
var sprintf = require('sprintf-js').sprintf;
var logic = require('./functions.js');

module.exports = {
  /**
    * Return the total number of transactions
    **/
  showMainMenu : function(storedTransactions){

    var stringFormat = "%-5s%-15s%-60s%-10s%-40s";
    console.log(sprintf(stringFormat, "ID", "DATE", "LEDGER", "AMOUNT", "COMPANY"));
    for(var i=0; i<storedTransactions.length; i++) {
      console.log(sprintf(stringFormat, i, storedTransactions[i].Date, storedTransactions[i].Ledger,
        storedTransactions[i].Amount, storedTransactions[i].Company));
    }
    console.log("TOTAL BALANCE: " + logic.getTotalBalance(storedTransactions));
  }
}
