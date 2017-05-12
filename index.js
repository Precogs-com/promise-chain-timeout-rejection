'use strict';

class PromiseTimeOutError extends Error {
  constructor(time) {
    super();
    this.name = 'PromiseTimeOutError';
    this.message = `Promise timed out after ${time} ms.`;
  }
}

class PromiseAlreadyTimedOutError extends Error {
  constructor(time) {
    super();
    this.name = 'PromiseAlreadyTimedOutError';
    this.message = `Promise has already timed out after ${time} ms.`;
  }
}

const PromiseChainTimeoutRejection = function PromiseChainTimeoutRejection(time) {
  this.time = time;
  this.isExpired = false;
};

PromiseChainTimeoutRejection.prototype.globalTimeoutRejection = function (promise) {
  return Promise.race([
    new Promise((resolve, reject) => setTimeout(() => {
      this.isExpired = true;
      return reject(new PromiseTimeOutError(this.time));
    }, this.time)),
    promise(),
  ]);
};

PromiseChainTimeoutRejection.prototype.chainTimeoutRejection = function (promise) {
  if (this.isExpired) {
    return Promise.reject(new PromiseAlreadyTimedOutError(this.time));
  }
  return promise();
};

module.exports = PromiseChainTimeoutRejection;
module.exports.PromiseTimeOutError = PromiseTimeOutError;
module.exports.PromiseAlreadyTimedOutError = PromiseAlreadyTimedOutError;
