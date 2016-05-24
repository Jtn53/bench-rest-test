var axios = require('axios');
var prompt = require('prompt');
var _ = require('lodash');

module.exports = {
  /**
    * Returns all transactions. It does the following:
    * 1) Makes a single API call to find the total # of transactions
    * 2) Based on that # to know when to stop, it grabs all the transactions
    * 3) Removes duplicates
    * 4) Cleans company names
    **/
  getAllTransactions : function() {
    return new Promise(function(resolve,reject) {
      getTransactionsTotalCount().then(function(transactionCount) {
        return getTransactionPagesByCount(transactionCount);
      }).then(function(transactionsByPage) {
        transactionsDuplicates = _.flatten(transactionsByPage);
        return removeDuplicates(transactionsDuplicates);
      }).then(function(nonDuplicatedTransactions) {
        return cleanCompanyNamesInTransactions(nonDuplicatedTransactions);
      }).then(function(transactionsClean) {
        resolve(transactionsClean);
      }).catch(function(error) {
        reject(error);
      });
    });
  },

  /**
    * Return the total balance from a given array of transactions
    **/
  getTotalBalance : function(transactions) {
    return _.sum(_.map(transactions, function(key, value) {
      return _.toNumber(key.Amount);
    }));
  },

  /**
    * Returns an array of available unique ledgers from a list of transactions
    **/
  getLedgers : function(transactions) {
    return _.uniq(_.map(transactions, (key, value) => key.Ledger ));
  },

  /**
    * Returns all transactions from a given category from a list of transactions
    **/
  getTransactionsByLedger : function(transactions, ledger) {
    return _.compact(_.map(transactions, function(key, value) {
      if (key.Ledger == ledger) {
        return key;
      }
    }));
  },

  /**
    * Returns all transactions from a given category from a list of transactions
    **/
  getTransactionsByDate : function(transactions, date) {
    return _.compact(_.map(transactions, function(key, value) {
      if (key.Date == date) {
        return key;
      }
    }));
  },

  /**
    * Returns an array of unique dates from a list of transactions, sorted from earliest to latest
    **/
  getDates : function(transactions) {
    return _.sortBy(_.uniq(_.map(transactions, (key, value) => key.Date )));
  }
}

/**
  * Return the total number of transactions. Assume that as long as there's at least
  * one transaction, the 1.json page will exist
  **/
function getTransactionsTotalCount(){
  return new Promise(function(resolve, reject) {
    var url = "https://resttest.bench.co/transactions/1.json";
    axios.get(url).then(function (response) {
        resolve(response.data.totalCount);
      }).catch(function(error) {
        reject(error);
      });
  });
}

/**
  * Returns an array of transactions up to the number provided
  **/
function getTransactionPagesByCount(maxCount){
  var page = 1;
  var currentCount = 0;
  var transactions = [];
  var transactionsPerPage = 10;

  while (currentCount < maxCount) {
    transactions.push(getTransactionsByPage(page));
    currentCount = currentCount + transactionsPerPage
    page++;
  }

  return Promise.all(transactions);
}

/**
  * Returns an array of transaction arrays in a given page by calling the API
  **/
function getTransactionsByPage(page) {
  return new Promise(function(resolve, reject) {
    var url = "https://resttest.bench.co/transactions/" + page + ".json";

    axios.get(url).then(function (response) {
        resolve(response.data.transactions);
    }).catch(function(err) {
      reject(err);
    });
  });
}

/**
  * Takes in array of transactions and returns array with duplicates removed
  * Assumption is that transactions with the same date, ledger, and value are duplicates.
  * This is a pretty ghetto way to remove dupes. If I have time, this can be better.
  **/
function removeDuplicates(transactions) {
  // Create an associative array that has the transaction details all stored in the key
  var associativeTransactions = {};
  for(var i=0; i<transactions.length; i++) {
    var transaction = transactions[i];
    associativeTransactions[transaction.Date + transaction.Ledger + transaction.Amount + transaction.Company] = transaction;
  }
  /** Since duplicate keys aren't allowed, by copying the associative array to a new one,
    * any duplicate keys about to be inserted into the new array will be ignored.
    **/
  var i = 0;
  var nonDuplicatedTransactions = [];
  for (var transaction in associativeTransactions) {
    nonDuplicatedTransactions[i++] = associativeTransactions[transaction];
  }
  return Promise.all(nonDuplicatedTransactions);
}

/**
  * Cleans up the company names. This is a difficult problem that would require discussion.
  * For now, I am making the assumption that anything not alphanumeric or a space is "garbage"
  **/
function cleanCompanyNamesInTransactions(transactions) {
  return _.map(transactions, function(key, value) {
    key.Company = key.Company.replace(/[^A-Za-z\s]/g, '');
    return key;
  });
}
