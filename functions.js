var request = require('request');
var axios = require('axios');
var prompt = require('prompt');

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


  // /**
  //   * Remove all duplicates from an array of transactions.
  //   * Assumption is that transactions with the same date, ledger, and value are duplicates.
  //   **/
  // function removeDuplicates() {
  //
  // }

  /**
    * Cleans up the company names. This is a difficult problem that would require discussion.
    * For now, I am making the assumption that anything not alphanumeric is "garbage"
    **/
  function cleanCompanyName(name) {
    return name.replace(/^[a-z0-9]+$/i, '');
  }
  // function getTotalBalance() {
  //
  // }
  //
  // /**
  //   * Returns all transactions from a given category from a list of transactions
  //   **/
  // function getTransactionsByCategory(transactions, category) {
  //
  // }
}
