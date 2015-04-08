"use strict";

const matchbook = require('matchbook');

const makeListConstructor = (pattern) => {
  const matches = matchbook.compile(pattern);
  const constructor = function(...fields) {
    if (!(this instanceof constructor)) {
      return new constructor(...fields);
    }

    if (!matches(fields)) {
      throw new Error("Type error!");
    }

    this.get = function(i) {
      if (arguments.length === 0) {
        return fields;
      } else {
        return fields[i];
      }
    };
  };

  return constructor;
};

const makeObjectConstructor = () => {
  throw new Error("not implemented yet");
};

const derive = (parent, child) => {
  child.prototype = Object.create(parent.prototype, {
    constructor: {
      value: child,
      enumerable: false,
      writable: false,
      configurable: false
    }
  });
};

const makeConstructor = (type, pattern) => {
  let constructor;
  if (Array.isArray(pattern)) {
    constructor = makeListConstructor(pattern);
  } else if (typeof pattern === 'object' && pattern) {
    constructor = makeObjectConstructor(pattern);
  } else {
    throw new Error("Value pattern must be an array or an object");
  }

  derive(type, constructor);
  return constructor;
};

const arrayEq = (a, b) => {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
};

module.exports = (setupFunction) => {
  if (typeof setupFunction !== 'function') {
    throw new Error("Must invoke brinks with a setup function");
  }

  const expectedArgCount = setupFunction.length;

  const typeConstructor = function(...args) {
    if (args.length !== expectedArgCount) {
      throw new Error(`Type constructor called with ${args.length} arguments; expected ${expectedArgCount}`);
    }

    const type = function() {};
    const simplePattern = matchbook.If(val => val instanceof type);

    let patternCreator;
    if (expectedArgCount === 0) {
      patternCreator = simplePattern;
    } else {
      patternCreator = (...typeParams) => {
        if (!arrayEq(typeParams, args)) {
          throw new Error("I don't know how to deal with interesting heterogenous recursion yet");
        }
        return simplePattern;
      };
    }

    const constructors = setupFunction.apply(patternCreator, args);

    for (let constructorName in constructors) {
      if (!constructors.hasOwnProperty(constructorName)) {
        continue;
      }
      const pattern = constructors[constructorName];
      type[constructorName] = makeConstructor(type, pattern);
    }

    return type;
  };

  if (setupFunction.length === 0) {
    return typeConstructor();
  } else {
    return typeConstructor;
  }
};
