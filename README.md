# method timeout rejection

> Reject promise (and all following) if it takes more than a set duration

### Usage

Constructor defines a timeout in milliseconds.
```javascript
const methodTimeout = require('method-timeout-rejection');

const promiseTimeout = new PromiseChainTimeoutRejection(1000);
```

Method `globalTimeoutRejection` wraps a promise in a promise, that acts in the exact same way as
the original promise (if the promise returns something in that time), otherwise rejects with a specific `PromiseTimeOutError`
error.

```javascript
promiseTimeout.globalTimeoutRejection(() => {
  return new Promise((resolve, reject) => {
    return setTimeout(() => {
      return resolve('hello');
    }, 1500);
  });
})
.catch((err) => {
  assert(err instanceof methodTimeout.MethodTimeOutError);
});
```

Method `chainTimeoutRejection` wraps one chained promise in a promise, that acts in the exact same way as
the original promise (if the global promise has not timeout), otherwise rejects with a specific `PromiseAlreadyTimedOutError`
error.

```javascript
let hasExecutedSecondPromise = false;
let errorSubPromise;

promiseTimeout.globalTimeoutRejection(() => {
  return new Promise((resolve, reject) => {
    return setTimeout(() => {
      return resolve('hello again');
    }, 1500);
  })
  .then((output) => promiseTimeout.chainTimeoutRejection(() => {
    hasExecutedSecondPromise = true; // Will not pass here...
    return Promise.resolve(output);
  }))
  .catch((err) => {
    errorSubPromise = err;
    return Promise.reject(errorSubPromise);
  });
})
.catch((err) => {
  assert(err instanceof PromiseChainTimeoutRejection.PromiseTimeOutError);
  setTimeout(() => {
    assert(hasExecutedSecondPromise === false); // ... as shown here
    assert(errorSubPromise instanceof PromiseChainTimeoutRejection.PromiseAlreadyTimedOutError);
    done();
  }, 600);
});
```