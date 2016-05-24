var request = require('request');
var axios = require('axios');
var prompt = require('prompt');
var sprintf = require('sprintf-js').sprintf;
var logic = require('./functions.js');
var _ = require('lodash');

var stringFormat = "%-5s%-15s%-60s%-10s%-40s";
var viewMainMenu = 0;
var viewLedgerOption = 1;
var viewDailyBalanceOption = 2;
var quitOption = 3;

module.exports = {

  navigateToMenu : function(menu, transactions) {
    if (menu == viewMainMenu) { showMainMenu(transactions); }
    else if (menu == viewLedgerOption) { showLedgerMenu(transactions); }
    else if (menu == viewDailyBalanceOption) { console.log("not yet"); }
    else if (menu == quitOption) { process.exit(); }
    else { console.log("Invalid option selected. Try again!"); getMainMenuPrompt(); };
  }
}

function showMainMenu(transactions){
  var storedTransactions = transactions;

  console.log(sprintf(stringFormat, "ID", "DATE", "LEDGER", "AMOUNT", "COMPANY"));
  for(var i=0; i<storedTransactions.length; i++) {
    console.log(sprintf(stringFormat, i, storedTransactions[i].Date, storedTransactions[i].Ledger,
      storedTransactions[i].Amount, storedTransactions[i].Company));
  }
  console.log("TOTAL BALANCE: " + logic.getTotalBalance(storedTransactions));
  console.log("Select from the following options: ");
  console.log(viewMainMenu + ") View all transactions");
  console.log(viewLedgerOption + ") View total balance from a ledger");
  console.log(viewDailyBalanceOption + ") View daily balances");
  console.log(quitOption + ") Exit");

  var promptSchema = {
    properties: {
      option: {
        description: "Select an option",
        pattern: /^\d{1}$/,
        message: "Enter a number corresponding to an option",
        required: true
      }
    }
  };

  prompt.get(promptSchema, function(err, result) {
    module.exports.navigateToMenu(result.option, transactions);
  });
}

function showLedgerMenu(transactions) {
  console.log("CHOOSE A LEDGER TO VIEW LEDGER'S TOTAL BALANCE: ");
  logic.getLedgers(transactions).then(function(ledgers) {
    var ledgerList = _.uniq(ledgers);
    for (var i=0; i<ledgerList.length; i++){
      console.log(i + ") " + ledgerList[i]);
    }
    return Promise.all(ledgerList);
  }).then(function(ledgerList){
    var promptSchema = {
      properties: {
        option: {
          description: "Select a ledger",
          pattern: /^\d{1}$/,
          message: "Enter a number corresponding to a ledger",
          required: true
        }
      }
    };

    prompt.get(promptSchema, function(err, result) {
      console.log("You chose " + result.option);
      logic.getTransactionsByLedger(transactions, ledgerList[result.option]).then(function(transactionsInLedger) {
        console.log(sprintf(stringFormat, "ID", "DATE", "LEDGER", "AMOUNT", "COMPANY"));
        for(var i=0; i<transactionsInLedger.length; i++) {
          console.log(sprintf(stringFormat, i, transactionsInLedger[i].Date, transactionsInLedger[i].Ledger,
            transactionsInLedger[i].Amount, transactionsInLedger[i].Company));
        }
        console.log("TOTAL BALANCE IN LEDGER: " + logic.getTotalBalance(transactionsInLedger));
        console.log("Select from the following options: ");
        console.log(viewMainMenu + ") View all transactions");
        console.log(viewLedgerOption + ") View total balance from a ledger");
        console.log(viewDailyBalanceOption + ") View daily balances");
        console.log(quitOption + ") Exit");

        var promptSchema = {
          properties: {
            option: {
              description: "Select an option",
              pattern: /^\d{1}$/,
              message: "Enter a number corresponding to an option",
              required: true
            }
          }
        };

        prompt.get(promptSchema, function(err, result) {
          module.exports.navigateToMenu(result.option, transactions);
        });
      });
    });
  });
}
