"use strict";

const makeListConstructor = () => {
  const constructor = function(...fields) {
    if (!(this instanceof constructor)) {
      return new constructor(...fields);
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

const makeConstructor = (type, pattern) => {
  let constructor;
  if (Array.isArray(pattern)) {
    constructor = makeListConstructor(pattern);
  } else if (typeof pattern === 'object' && pattern) {
    constructor = makeObjectConstructor(pattern);
  } else {
    throw new Error("Value pattern must be an array or an object");
  }

  constructor.prototype = Object.create(type.prototype, {
    constructor: {
      value: constructor,
      enumerable: false,
      writable: false,
      configurable: false
    }
  });
  return constructor;
};

module.exports = (setupFunction) => {
  if (typeof setupFunction !== 'function') {
    throw new Error("Must invoke brinks with a setup function");
  }
  // if (setupFunction.length > 0) {
  //   throw new Error("Parameterized types are not implemented yet");
  // }

  const type = function() {};
  const constructors = setupFunction.call(type);

  for (let constructorName in constructors) {
    if (!constructors.hasOwnProperty(constructorName)) {
      continue;
    }
    const pattern = constructors[constructorName];
    type[constructorName] = makeConstructor(type, pattern);
  }

  return type;
};
