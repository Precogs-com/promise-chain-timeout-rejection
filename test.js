'use strict'

const assert = require('assert')

const PromiseChainTimeoutRejection = require('./')

describe('timeouts', () => {
  it('should resolve', (done) => {
    const value = 'resolve simple';
    const timeout = 1000;

    const promiseTimeout = new PromiseChainTimeoutRejection(timeout);

    promiseTimeout.globalTimeoutRejection(() => new Promise((resolve, reject) => {
      return setTimeout(() => {
        return resolve(value);
      }, 500);
    }))
    .then((output) => {
      assert(output === value);
      done();
    })
    .catch(() => {
      assert(false);
      done();
    });
  });

  it('should reject with promise error', (done) => {
    const value = 'resolve simple 2';
    const timeout = 1000;

    const promiseTimeout = new PromiseChainTimeoutRejection(timeout);

    promiseTimeout.globalTimeoutRejection(() => new Promise((resolve, reject) => {
      return setTimeout(() => {
        return reject(new Error(value));
      }, 600);
    }))
    .then(() => {
      assert(false);
      done();
    })
    .catch((err) => {
      assert(err.message === value);
      done();
    })
  });

  it('should reject with time out error', (done) => {
    const value = 'resolve simple 3';
    const timeout = 1000;

    const promiseTimeout = new PromiseChainTimeoutRejection(timeout);

    promiseTimeout.globalTimeoutRejection(() => new Promise((resolve, reject) => {
      return setTimeout(() => {
        return resolve(value);
      }, 1500);
    }))
    .then(() => {
      assert(false);
      done();
    })
    .catch((err) => {
      assert(err instanceof PromiseChainTimeoutRejection.PromiseTimeOutError);
      done();
    })
  });

  it('should resolve (case with chaining)', (done) => {
    const value = 'resolve chaining';
    const timeout = 1000;

    const promiseTimeout = new PromiseChainTimeoutRejection(timeout);
    let hasExecutedSecondPromise = false;
    let errorSubPromise;

    promiseTimeout.globalTimeoutRejection(() => new Promise((resolve, reject) => {
        return setTimeout(() => {
          return resolve(value);
        }, 500);
      })
      .then((output) => promiseTimeout.chainTimeoutRejection(() => {
        hasExecutedSecondPromise = true;
        return Promise.resolve(output);
      }))
      .catch((err) => {
        errorSubPromise = err;
        return Promise.reject(errorSubPromise);
      })
    )
    .then((output) => {
      assert(output === value);
      setTimeout(() => {
        assert(hasExecutedSecondPromise === true);
        assert(typeof errorSubPromise === 'undefined');
        done();
      }, 600);
    })
    .catch(() => {
      assert(false);
      done();
    });
  });

  it('should reject with promise error (case with chaining)', (done) => {
    const value = 'resolve chaining 2';
    const timeout = 1000;

    const promiseTimeout = new PromiseChainTimeoutRejection(timeout);
    let hasExecutedSecondPromise = false;
    let errorSubPromise;

    promiseTimeout.globalTimeoutRejection(() => new Promise((resolve, reject) => {
        return setTimeout(() => {
          return reject(new Error(value));
        }, 600);
      })
      .then((output) => promiseTimeout.chainTimeoutRejection(() => {
        hasExecutedSecondPromise = true;
        return Promise.resolve(output);
      }))
      .catch((err) => {
        errorSubPromise = err;
        return Promise.reject(errorSubPromise);
      })
    )
    .then(() => {
      assert(false);
      done();
    })
    .catch((err) => {
      assert(err.message === value);
      setTimeout(() => {
        assert(hasExecutedSecondPromise === false);
        assert(errorSubPromise.message === value);
        done();
      }, 600);
    })
  });

  it('should reject with time out error (case with chaining)', (done) => {
    const value = 'resolve chaining 3';
    const timeout = 1000;

    const promiseTimeout = new PromiseChainTimeoutRejection(timeout);
    let hasExecutedSecondPromise = false;
    let errorSubPromise;

    promiseTimeout.globalTimeoutRejection(() => new Promise((resolve, reject) => {
        return setTimeout(() => {
          return resolve(value);
        }, 1500);
      })
      .then((output) => promiseTimeout.chainTimeoutRejection(() => {
        hasExecutedSecondPromise = true;
        return Promise.resolve(output);
      }))
      .catch((err) => {
        errorSubPromise = err;
        return Promise.reject(errorSubPromise);
      })
    )
    .then(() => {
      assert(false);
      done();
    })
    .catch((err) => {
      assert(err instanceof PromiseChainTimeoutRejection.PromiseTimeOutError);
      setTimeout(() => {
        assert(hasExecutedSecondPromise === false);
        assert(errorSubPromise instanceof PromiseChainTimeoutRejection.PromiseAlreadyTimedOutError);
        done();
      }, 600);
    })
  });

  it('should reject with time out error (even if error - case with chaining)', (done) => {
    const value = 'resolve chaining 4';
    const timeout = 1000;

    const promiseTimeout = new PromiseChainTimeoutRejection(timeout);
    let hasExecutedSecondPromise = false;
    let errorSubPromise;

    promiseTimeout.globalTimeoutRejection(() => new Promise((resolve, reject) => {
        return setTimeout(() => {
          return reject(new Error(value));
        }, 1500);
      })
      .then((output) => promiseTimeout.chainTimeoutRejection(() => {
        hasExecutedSecondPromise = true;
        return Promise.resolve(output);
      }))
      .catch((err) => {
        errorSubPromise = err;
        return Promise.reject(errorSubPromise);
      })
    )
    .then(() => {
      assert(false);
      done();
    })
    .catch((err) => {
      assert(err instanceof PromiseChainTimeoutRejection.PromiseTimeOutError);
      setTimeout(() => {
        assert(hasExecutedSecondPromise === false);
        assert(errorSubPromise.message === value);
        done();
      }, 600);
    })
  });

  it('should reject with time out error (case with double chaining)', (done) => {
    const value = 'resolve double chaining';
    const timeout = 1000;

    const promiseTimeout = new PromiseChainTimeoutRejection(timeout);
    let hasExecutedSecondPromise = false;
    let hasExecutedThirdPromise = false;
    let errorSubPromise;

    promiseTimeout.globalTimeoutRejection(() => new Promise((resolve, reject) => {
        return setTimeout(() => {
          return resolve(value);
        }, 500);
      })
      .then((output) => promiseTimeout.chainTimeoutRejection(() => new Promise((resolve, reject) => {
        return setTimeout(() => {
          hasExecutedSecondPromise = true;
          return resolve(value);
        }, 700);
      })))
      .then((output) => promiseTimeout.chainTimeoutRejection(() => {
        hasExecutedThirdPromise = true;
        return Promise.resolve(output);
      }))
      .catch((err) => {
        errorSubPromise = err;
        return Promise.reject(errorSubPromise);
      })
    )
    .then(() => {
      assert(false);
      done();
    })
    .catch((err) => {
      assert(err instanceof PromiseChainTimeoutRejection.PromiseTimeOutError);
      setTimeout(() => {
        assert(hasExecutedSecondPromise === true);
        assert(hasExecutedThirdPromise === false);
        assert(errorSubPromise instanceof PromiseChainTimeoutRejection.PromiseAlreadyTimedOutError);
        done();
      }, 600);
    })
  });
})
