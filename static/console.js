function Console(max_lines) {
  var scroller = document.createElement('div');
  scroller.style.overflow = 'auto';
  scroller.className = 'console';
  this.scroller = scroller;

  this.max_lines = max_lines;

  // Define a global var to access this console.
  console_main = this;
};

Console.prototype.toWidth = function(num, width) {
  var out = num.toString();
  while (out.length < width) out = '0' + out;
  return out;
};

Console.prototype.write = function(str) {
  while (this.max_lines > 0 &&
         this.scroller.childNodes.length >= this.max_lines) {
    this.scroller.removeChild(this.scroller.childNodes[0]);
  }

  var now = new Date();
  var time = this.toWidth(now.getHours(), 2) + ":" +
             this.toWidth(now.getMinutes(), 2) + ":" +
             this.toWidth(now.getSeconds(), 2);

  var line = document.createElement('div');
  line.innerHTML = '<span class="time">' + time + '</span> ' + str;
  line.className = 'line';
  this.scroller.appendChild(line);
  this.scroller.scrollTop = line.offsetTop;
};

function log(str) {
  if (console_main) console_main.write(str);
}
