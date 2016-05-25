import prompt from 'prompt';
import { sprintf } from 'sprintf-js';
import * as logic from './functions.js';
import _ from 'lodash';

const transactionStringFormat = "%-13s%-43s%-10s%-40s";

export const viewMainMenu = "0";
const viewLedgerOption = "1";
const viewDailyBalanceOption = "2";
const quitOption = "3";

/**
  * Go to a specific screen or exit the application based on a user's input option
  **/
export function navigateToMenu(option, transactions) {
  switch(option) {
    case viewMainMenu:
      showMainScreen(transactions);
      break;
    case viewLedgerOption:
      showLedgerScreen(transactions);
      break;
    case viewDailyBalanceOption:
      showDailyBalanceScreen(transactions);
      break;
    case quitOption:
      process.exit();
    default:
      printLine();
      console.log("Invalid option selected. Try again!");
      showMainMenu(transactions);
  }
}

/**
  * Main screen that shows all transactions and prompts user to select an option
  **/
function showMainScreen(transactions){
  printLine();
  console.log(sprintf(transactionStringFormat, "DATE", "LEDGER", "AMOUNT", "COMPANY"));
  printLine();

  // loop and display all the transactions
  _.forEach(transactions, (transaction, index) => {
    console.log(sprintf(transactionStringFormat, transactions[index].Date,
      transactions[index].Ledger, transactions[index].Amount, transactions[index].Company));
  });

  printLine();
  console.log(`TOTAL BALANCE: ${logic.getTotalBalance(transactions)}`);
  showMainMenu(transactions);
}

/**
  * Menu for user to select options
  **/
function showMainMenu(transactions) {
  const promptSchema = {
    properties: {
      option: {
        description: "Select an option",
        pattern: /^\d$/,
        message: "Invalid option selected. Try again!",
        required: true
      }
    }
  };
  printLine();
  console.log("Select from the following options: ");
  console.log(`${viewMainMenu}) View all transactions`);
  console.log(`${viewLedgerOption}) View total balance from a ledger`);
  console.log(`${viewDailyBalanceOption}) View daily balances`);
  console.log(`${quitOption}) Exit`);

  prompt.get(promptSchema, (err, result) => {
    navigateToMenu(result.option, transactions);
  });
}

/**
  * Show the screen that displays all the transactions in a selected ledgerList
  **/
function showLedgerScreen(transactions) {
  printLine();
  console.log("CHOOSE A LEDGER TO VIEW LEDGER'S TOTAL BALANCE: ");
  printLine();
  const ledgerList = logic.getLedgers(transactions);

  // loop through and display all the possible ledgers for the user to select
  _.forEach(ledgerList, (ledger, index) => {
    console.log(`${index}) ${ledgerList[index]}`);
  });

  const promptSchema = {
    properties: {
      option: {
        description: "Select a ledger",
        pattern: /^\d{1,}$/,
        message: "Please enter numbers only",
        required: true
      }
    }
  };

  // display the qualifying transactions after the user enters a ledger option into the prompt
  prompt.get(promptSchema, (err, result) => {
    const transactionsInLedger = logic.getTransactionsByLedger(transactions, ledgerList[result.option]);
    printLine();
    console.log(sprintf(transactionStringFormat, "DATE", "LEDGER", "AMOUNT", "COMPANY"));
    printLine();
    // Display all the transactions in the selected ledger
    _.map(transactionsInLedger, (key, value) => {
      console.log(sprintf(transactionStringFormat, key.Date, key.Ledger, key.Amount, key.Company));
    });
    printLine();
    console.log(`TOTAL BALANCE IN LEDGER: ${logic.getTotalBalance(transactionsInLedger)}`);
    showMainMenu(transactions);
  });
}

/**
  * Show the running total
  **/
function showDailyBalanceScreen(transactions) {
  const dates = logic.getDates(transactions);
  const dateStringFormat = "%-15s%-15s";

  printLine();
  console.log(sprintf(dateStringFormat, "DATE", "RUNNING TOTAL"));
  printLine();

  // Display all the dates + running totals
  let dateBalance = 0;
  _.map(dates, (key, value) => {
    dateBalance += logic.getTotalBalance(logic.getTransactionsByDate(transactions, key));
    // Due to precision issues, need to round to 2 decimal places.
    // Not the best fix. If I had more time, would look at alternate solution.
    console.log(sprintf(dateStringFormat, key, dateBalance.toFixed(2)));
  });
  showMainMenu(transactions);
}

/**
  * Print a line in the console
  **/
function printLine() {
  console.log("------------------------------------------------------------------------------------------------");
}
