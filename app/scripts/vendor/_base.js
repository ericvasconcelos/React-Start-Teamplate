// We don't use jquery, but we test if window object has it and
// External libs use it.
// This is solution is strange but works, we need to do some
// research and see if its can change.
window.jQuery = require('./jquery-1.11.3.min.js');
window.$ = require('./jquery-1.11.3.min.js');