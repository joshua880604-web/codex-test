/* Feature-detected startup support for iOS 14 Safari. No network or tracking. */
(function () {
  "use strict";
  function define(target, name, value) {
    if (typeof target[name] !== "function") {
      Object.defineProperty(target, name, {
        value: value, configurable: true, writable: true, enumerable: false
      });
    }
  }
  function relativeIndex(index, length) {
    var n = +index;
    if (n !== n) n = 0;
    n = n < 0 ? Math.ceil(n) : Math.floor(n);
    return n < 0 ? length + n : n;
  }
  define(Array.prototype, "at", function (index) {
    if (this == null) throw new TypeError("Array.at called on null or undefined");
    var value = Object(this), length = +value.length;
    if (length !== length || length < 0) length = 0;
    length = Math.min(Math.floor(length), 9007199254740991);
    var i = relativeIndex(index, length);
    return i < 0 || i >= length ? undefined : value[i];
  });
  define(String.prototype, "at", function (index) {
    if (this == null) throw new TypeError("String.at called on null or undefined");
    if (typeof this === "symbol") throw new TypeError("Cannot convert a Symbol to a string");
    var value = String(this), i = relativeIndex(index, value.length);
    return i < 0 || i >= value.length ? undefined : value.charAt(i);
  });
  define(Object, "hasOwn", function (value, key) {
    if (value == null) throw new TypeError("Object.hasOwn called on null or undefined");
    return Object.prototype.hasOwnProperty.call(value, key);
  });
  define(Promise, "withResolvers", function () {
    var resolve, reject;
    var promise = new this(function (a, b) { resolve = a; reject = b; });
    return {promise: promise, resolve: resolve, reject: reject};
  });
  if (typeof HTMLFormElement !== "undefined") {
    define(HTMLFormElement.prototype, "requestSubmit", function (submitter) {
      if (submitter != null) {
        if (!/^(BUTTON|INPUT)$/.test(submitter.tagName) || !/^(submit|image)$/.test(submitter.type)) {
          throw new TypeError("The submitter must be a submit button");
        }
        if (submitter.form !== this) throw new DOMException("Submitter belongs to another form", "NotFoundError");
        submitter.click();
        return;
      }
      var button = document.createElement("button");
      button.type = "submit";
      button.hidden = true;
      this.appendChild(button);
      try { button.click(); } finally { this.removeChild(button); }
    });
  }
}());
