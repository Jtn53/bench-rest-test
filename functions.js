import axios from 'axios';
import prompt from 'prompt';
import _ from 'lodash';

/**
  * Returns all transactions. It does the following:
  * 1) Makes a single API call to find the total # of transactions
  * 2) Based on that # to know when to stop, it grabs all the transactions
  * 3) Removes duplicates
  * 4) Cleans company names
  **/
export function getAllTransactions() {
  return new Promise(function(resolve,reject) {
    getTransactionPageProperties().then(([totalCount, countPerPage]) => {
      return getTransactionPagesByCount(totalCount, countPerPage);
    }).then((transactionsByPage) => {
      return removeDuplicates(transactionsByPage);
    }).then((nonDuplicatedTransactions) => {
      return cleanCompanyNamesInTransactions(nonDuplicatedTransactions);
    }).then((transactionsClean) => {
      resolve(transactionsClean);
    }).catch((err) => {
      reject(err);
    });
  });
}

/**
  * Return the total balance from a given array of transactions
  **/
export function getTotalBalance(transactions) {
  let sum = _.sum(_.map(transactions, (key) => { return Number(key.Amount); }));
  /**
    * We are rounding to 2 decimal places. There is a transaction that's causing
    * the sum to freak out and go to like 8 decimals. Due to time, this is the workaround.
    */
  return sum.toFixed(2);
}

/**
  * Returns an array of available unique ledgers from a list of transactions
  **/
export function getLedgers(transactions) {
  return _.uniq(_.map(transactions, (key) => key.Ledger ));
}

/**
  * Returns all transactions from a given category from a list of transactions
  **/
export function getTransactionsByLedger(transactions, ledger) {
  return _.compact(_.map(transactions, (key) => {
    if (key.Ledger == ledger) {
      return key;
    }
  }));
}

/**
  * Returns all transactions from a given category from a list of transactions
  **/
export function getTransactionsByDate(transactions, date) {
  return _.compact(_.map(transactions, (key) => {
    if (key.Date == date) {
      return key;
    }
  }));
}

/**
  * Returns an array of unique dates from a list of transactions, sorted from earliest to latest
  **/
export function getDates(transactions) {
  return _.sortBy(_.uniq(_.map(transactions, (key) => key.Date )));
}

/**
  * Return the total number of transactions. Assume that as long as there's at least
  * one transaction, the 1.json page will exist
  **/
function getTransactionPageProperties(){
  const url = "https://resttest.bench.co/transactions/1.json";

  return new Promise((resolve, reject) => {
    axios.get(url).then((response) => {
      resolve([response.data.totalCount, Object.keys(response.data.transactions).length]);
    }).catch(err => {
      console.log(err);
    });
  })
}

/**
  * Returns an array of transactions up to the number provided
  * Assumption: page 1 will always be the first page
  **/
function getTransactionPagesByCount(maxCount, countPerPage){
  let page = 1;
  let currentCount = 0;
  let transactions = [];

  while (currentCount < maxCount) {
    transactions.push(getTransactionsByPage(page));
    currentCount = currentCount + countPerPage
    page++;
  }

  // flatten the transactions before we return it
  return Promise.all(transactions).then((transactions) => {
    return _.flatten(transactions);
  });
}

/**
  * Returns an array of transaction arrays in a given page by calling the API
  **/
function getTransactionsByPage(page) {
  let url = `https://resttest.bench.co/transactions/${page}.json`;
  return new Promise((resolve, reject) => {
    axios.get(url).then((response) => {
      resolve(response.data.transactions);
    }).catch((err) => {
      console.log(err);
    });
  });
}

/**
  * Takes in array of transactions and returns array with duplicates removed
  * Assumption is that transactions with the same date, ledger, and value are duplicates.
  * This is a pretty ghetto way to remove duplicates. If I have time, this can be better.
  **/
function removeDuplicates(transactions) {
  // Create an associative array that has the transaction details all stored in the key
  let associativeTransactions = {};
  for(let i=0; i<transactions.length; i++) {
    let transaction = transactions[i];
    associativeTransactions[transaction.Date + transaction.Ledger + transaction.Amount + transaction.Company] = transaction;
  }
  /** Since duplicate keys aren't allowed, by copying the associative array to a new one,
    * any duplicate keys about to be inserted into the new array will be ignored.
    **/
  let j = 0;
  let nonDuplicatedTransactions = [];
  for (let transaction in associativeTransactions) {
    nonDuplicatedTransactions[j++] = associativeTransactions[transaction];
  }
  return Promise.all(nonDuplicatedTransactions);
}

/**
  * Cleans up the company names. This is a difficult problem that would require discussion.
  * For now, I am making the assumption that anything not alphanumeric or a space is "garbage"
  **/
function cleanCompanyNamesInTransactions(transactions) {
  return _.map(transactions, (key) => {
    key.Company = key.Company.replace(/[^A-Za-z\s]/g, '');
    return key;
  });
}
