const exp = {};

exp.pipe2 = (fn1, fn2) => (...args) => fn2(fn1(...args));
exp.pipe = (...fns) => fns.reduce(exp.pipe2);

exp.unary = fn => (arg) => fn(arg);

exp.noFirstWord = str => str.substring(str.indexOf(' ') + 1);
exp.firstWord = str => str.split(' ')[0];

module.exports = exp;
