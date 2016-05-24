var request = require('request');
var axios = require('axios');
var prompt = require('prompt');
var _ = require('lodash');

module.exports = {
  /**
    * Return the total number of transactions
    **/
  getTransactionsTotalCount : function(){
    return new Promise(function(resolve, reject) {
      var url = "https://resttest.bench.co/transactions/1.json";
      axios.get(url)
        .then(function (response) {
          resolve(response.data.totalCount);
        })
        .catch(function(error) {
          reject("yo what");
        });
    });
  },

  /**
    * Returns an array of transactions up to the number provided
    **/
  getTransactionPagesByCount : function(maxCount){
    var page = 1;
    var currentCount = 0;
    var transactions = [];
    var transactionsPerPage = 10;

    while (currentCount < maxCount) {
      transactions.push(module.exports.getTransactionsByPage(page));
      currentCount = currentCount + transactionsPerPage
      page++;
    }

    return Promise.all(transactions);
  },

  /**
    * Returns an array of transaction arrays in a given page by calling the API
    **/
  getTransactionsByPage : function(page) {
    return new Promise(function(resolve, reject) {
      var url = "https://resttest.bench.co/transactions/" + page + ".json";

      axios.get(url).then(function (response) {
          resolve(response.data.transactions);
      }).catch(function(err) {
        reject(err);
      });
    });
  },

  /**
    * Takes in array of transactions and returns array with duplicates removed
    * Assumption is that transactions with the same date, ledger, and value are duplicates.
    **/
  removeDuplicates : function(transactions) {
    var associativeTransactions = {};

    for(var i=0; i<transactions.length; i++) {
      var transaction = transactions[i];
      associativeTransactions[transaction.Date + transaction.Ledger + transaction.Amount + transaction.Company] = transaction;
    }

    var i = 0;
    var nonDuplicatedTransactions = [];
    for (var transaction in associativeTransactions) {
      nonDuplicatedTransactions[i++] = associativeTransactions[transaction];
    }

    return Promise.all(nonDuplicatedTransactions);
  },

  /**
    * Cleans up the company names. This is a difficult problem that would require discussion.
    * For now, I am making the assumption that anything not alphanumeric or a space is "garbage"
    **/
  cleanCompanyNamesInTransactions : function(transactions) {
    //TODO: Don't modify the passed-in transactions
    var transactionsResult = [];

    for(var i=0; i<transactions.length; i++) {
      transactions[i].Company = transactions[i].Company.replace(/[^A-Za-z\s]/g, '');
      transactionsResult.push(transactions[i]);
    }
    return Promise.all(transactionsResult);
  },

  /**
    * Return the total balance from a given array of transactions
    **/
  getTotalBalance : function(transactions) {
    return _.sum(_.map(transactions, function(key, value) {
      return _.toNumber(key.Amount);
    }));
  }
  //
  // /**
  //   * Returns all transactions from a given category from a list of transactions
  //   **/
  // function getTransactionsByCategory(transactions, category) {
  //
  // }
}
