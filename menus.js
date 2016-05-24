var prompt = require('prompt');
var sprintf = require('sprintf-js').sprintf;
var logic = require('./functions.js');
var _ = require('lodash');

var transactionStringFormat = "%-15s%-50s%-10s%-40s";
var viewMainMenu = 0;
var viewLedgerOption = 1;
var viewDailyBalanceOption = 2;
var quitOption = 3;

module.exports = {
  /**
    * Go to a specific screen or exit the application based on a user's input option
    **/
  navigateToMenu : function(menu, transactions) {
    if (menu == viewMainMenu) { showMainScreen(transactions); }
    else if (menu == viewLedgerOption) { showLedgerScreen(transactions); }
    else if (menu == viewDailyBalanceOption) { showDailyBalanceScreen(transactions); }
    else if (menu == quitOption) { process.exit(); }
    else { console.log("Invalid option selected. Try again!"); getMainMenuPrompt(); };
  }
}

/**
  * Main screen that shows all transactions and prompts user to select an option
  **/
function showMainScreen(transactions){
  var storedTransactions = transactions;
  printLine();
  console.log(sprintf(transactionStringFormat, "DATE", "LEDGER", "AMOUNT", "COMPANY"));
  printLine();

  // loop and display all the transactions
  for(var i=0; i<storedTransactions.length; i++) {
    console.log(sprintf(transactionStringFormat, storedTransactions[i].Date, storedTransactions[i].Ledger,
      storedTransactions[i].Amount, storedTransactions[i].Company));
  }

  printLine();
  console.log("TOTAL BALANCE: " + logic.getTotalBalance(storedTransactions));
  printLine();
  showMainMenu(transactions);
}

/**
  * Menu for user to select options
  **/
function showMainMenu(transactions) {
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

  console.log("Select from the following options: ");
  console.log(viewMainMenu + ") View all transactions");
  console.log(viewLedgerOption + ") View total balance from a ledger");
  console.log(viewDailyBalanceOption + ") View daily balances");
  console.log(quitOption + ") Exit");

  prompt.get(promptSchema, function(err, result) {
    module.exports.navigateToMenu(result.option, transactions);
  });
}

/**
  * Show the screen that displays all the transactions in a selected ledgerList
  **/
function showLedgerScreen(transactions) {
  printLine();
  console.log("CHOOSE A LEDGER TO VIEW LEDGER'S TOTAL BALANCE: ");
  printLine();
  var ledgerList = logic.getLedgers(transactions);

  // loop through and display all the possible ledgers for the user to select
  for (var i=0; i<ledgerList.length; i++){
    console.log(i + ") " + ledgerList[i]);
  }
  return Promise.all(ledgerList).then(function(ledgerList){
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

    // display the qualifying transactions after the user enters a ledger option into the prompt
    prompt.get(promptSchema, function(err, result) {
      var transactionsInLedger = logic.getTransactionsByLedger(transactions, ledgerList[result.option]);
      printLine();
      console.log(sprintf(transactionStringFormat, "DATE", "LEDGER", "AMOUNT", "COMPANY"));
      printLine();
      // Display all the transactions in the selected ledger
      _.map(transactionsInLedger, function(key, value) {
        console.log(sprintf(transactionStringFormat, key.Date, key.Ledger, key.Amount, key.Company));
      });
      printLine();
      console.log("TOTAL BALANCE IN LEDGER: " + logic.getTotalBalance(transactionsInLedger));
      printLine();
      showMainMenu(transactions);
    });
  });
}

/**
  * Show the running total
  **/
function showDailyBalanceScreen(transactions) {
  var dates = logic.getDates(transactions);
  var dateStringFormat = "%-15s%-15s";
  console.log(sprintf(dateStringFormat, "DATE", "RUNNING TOTAL"));

  // Display all the dates + running totals
  var dateBalance = 0;
  _.map(dates, function(key, value) {
    dateBalance += logic.getTotalBalance(logic.getTransactionsByDate(transactions, key));
    console.log(sprintf(dateStringFormat, key, dateBalance));
  });
  showMainMenu(transactions);
}

/**
  * Print a line in the console
  **/
function printLine() {
  console.log("------------------------------------------------------------------------------------------------");
}
