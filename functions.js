import axios from 'axios';
import _ from 'lodash';

/**
  * Returns all transactions. It does the following:
  * 1) Makes a single API call to find the total # of transactions
  * 2) Based on that # to know when to stop, it grabs all the transactions
  * 3) Removes duplicates
  * 4) Cleans company names
  **/
export function getAllTransactions() {
  return getTransactionPageProperties().then(([totalCount, countPerPage]) => {
    return getTransactionPagesByCount(totalCount, countPerPage);
  }).then((transactionsByPage) => {
    const nonDuplicatedTransactions = removeDuplicates(transactionsByPage);
    return cleanCompanyNamesInTransactions(nonDuplicatedTransactions);
  }).catch((err) => {
    console.log(err);
  });
}

/**
  * Return the total balance from a given array of transactions
  **/
export function getTotalBalance(transactions) {
  const sum = _.sum(_.map(transactions, (key) => { return Number(key.Amount); }));
  /**
    * We are rounding to 2 decimal places. There is a transaction that's causing
    * the sum to freak out and go to like 8 decimals. Due to time, this is the workaround.
    */
  return Number(sum.toFixed(2));
}

/**
  * Returns an array of available unique ledgers from a list of transactions
  **/
export function getLedgers(transactions) {
  return _.uniq(_.map(transactions, (key) => key.Ledger ));
}

/**
  * Returns all transactions from a given ledger
  **/
export function getTransactionsByLedger(transactions, ledger) {
  return _.compact(_.map(transactions, (key) => {
    if (key.Ledger == ledger) {
      return key;
    }
  }));
}

/**
  * Returns all transactions from a given date
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
  * Return the total number of transactions in total and per page.
  * Assume that as long as there's at least one transaction, the 1.json page will exist
  **/
function getTransactionPageProperties(){
  const url = "https://resttest.bench.co/transactions/1.json";

  return axios.get(url).then((response) => {
    return [response.data.totalCount, response.data.transactions.length];
  }).catch(err => {
    console.log(err);
  });
}

/**
  * Returns an array of transactions up to the count provided.
  * This calls getTransactionsByPage and will cycle through all the transaction pages.
  **/
function getTransactionPagesByCount(maxCount, countPerPage){
  let page = 1;
  let currentCount = 0;
  let transactions = [];

  // As long as we haven't reached the maxCount, continue to push transactions into the array
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
  const url = `https://resttest.bench.co/transactions/${page}.json`;

  return axios.get(url).then((response) => {
    return response.data.transactions;
  }).catch((err) => {
    console.log(err);
  });
}

/**
  * Takes in array of transactions and returns array with duplicates removed
  * Assumption is that transactions with the same date, ledger, and value are duplicates.
  **/
function removeDuplicates(transactions) {
  // Filter duplicates by grabbing all the properties in the transaction and then joining them.
  // Then compare the joined transaction properties with each other and remove deuplicates.
  return _.uniqBy(transactions, (key) => {
    return [_.valuesIn(key)].join();
  });
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
