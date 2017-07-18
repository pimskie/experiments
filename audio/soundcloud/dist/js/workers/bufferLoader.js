(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/* eslint-env worker */

var xhr = null;

/**
 * only used to trigger the load of a audio file
 * the loading is followed by decoding
 */
onmessage = function onmessage(e) {
  var options = e.data;

  console.log('ww', options);
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGpzXFx3b3JrZXJzXFxidWZmZXJMb2FkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0FDRUEsSUFBSSxNQUFNLElBQVY7Ozs7OztBQU1BLFlBQVksbUJBQVMsQ0FBVCxFQUFZO0FBQ3ZCLE1BQUksVUFBVSxFQUFFLElBQWhCOztBQUVBLFVBQVEsR0FBUixDQUFZLElBQVosRUFBa0IsT0FBbEI7QUFDQSxDQUpEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIGVzbGludC1lbnYgd29ya2VyICovXHJcblxyXG5sZXQgeGhyID0gbnVsbDtcclxuXHJcbi8qKlxyXG4gKiBvbmx5IHVzZWQgdG8gdHJpZ2dlciB0aGUgbG9hZCBvZiBhIGF1ZGlvIGZpbGVcclxuICogdGhlIGxvYWRpbmcgaXMgZm9sbG93ZWQgYnkgZGVjb2RpbmdcclxuICovXHJcbm9ubWVzc2FnZSA9IGZ1bmN0aW9uKGUpIHtcclxuXHRsZXQgb3B0aW9ucyA9IGUuZGF0YTtcclxuXHJcblx0Y29uc29sZS5sb2coJ3d3Jywgb3B0aW9ucyk7XHJcbn07Il19
