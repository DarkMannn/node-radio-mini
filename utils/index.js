const exp = {};

exp.pipe2 = (fn1, fn2) => (...args) => fn2(fn1(...args));
exp.pipe = (...fns) => fns.reduce(exp.pipe2);

exp.only1 = fn => (arg) => fn(arg);

module.exports = exp;
