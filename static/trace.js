// Trace -- logging.
var Trace = {
  now: function() {
    return (new Date()).getTime();
  },
  init: function() {
    Trace.container = document.getElementById('trace');
    this.log = document.createElement('p');
    Trace.container.appendChild(this.log);
    this.start = Trace.now();
  },

  stamp: function(str) {
    if (!this.log)
      this.init();
    var entry = (Trace.now() - this.start) + "ms: " + str;
    this.log.insertBefore(document.createElement('br'), this.log.firstChild);
    this.log.insertBefore(document.createTextNode(entry), this.log.firstChild);
  }
};
function trace(str) {
  Trace.stamp(str);
};
