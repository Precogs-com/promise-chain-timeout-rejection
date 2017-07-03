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
  let timeout;
  return Promise.race([
    new Promise((resolve, reject) => {
      timeout = setTimeout(() => {
        this.isExpired = true;
        return reject(new PromiseTimeOutError(this.time));
      }, this.time);
      return timeout;
    }),
    new Promise((resolve, reject) => promise()
    .then((data) => {
      clearTimeout(timeout);
      return resolve(data);
    })
    .catch((err) => {
      clearTimeout(timeout);
      return reject(err);
    })),
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
