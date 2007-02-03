
function Multiplayer(serverurl, widget) {
  this.players = {};
  this.events = [];
  this.url = serverurl;
  this.widget = widget;
  var mp = this;
  this.widget.onChanged = function(x,y,letter) { mp.addEvent(x,y,letter); };
  this.sendUpdate('?full');
}

Multiplayer.prototype.renewCallback = function() {
  var mp = this;
  window.setTimeout(function(){mp.sendUpdate()}, 200);
}

Multiplayer.prototype.addEvent = function(x, y, update) {
  // Super cheesy -- users hit lowercase keys for regular answers and
  // uppercase for guesses, but the client-to-server communication is
  // probably more intuitive if sure answers are uppercase and guesses are
  // lower, so we swap the case here.
  var ch = update.charCodeAt(0);
  if (ch >= 97 && ch <= 122) {
    update = update.toUpperCase();
  } else if (ch >= 65 && ch <= 90) {
    update = update.toLowerCase();
  }
  this.events.push(['foo', 'xy', x, y, update].join('\t'));
}

// Send an update to the server and forward its response to processUpdate.
Multiplayer.prototype.sendUpdate = function(extra) {
  var update = this.events.join('\n');
  this.events = [];

  var req = new XMLHttpRequest();
  var mp = this;
  var url = this.url + 'state.js';
  if (extra)
    url += extra

  req.onreadystatechange = function() {
    if (req.readyState == 4) {
      if (req.status == 200) {
        var state = eval('('+req.responseText+')');
        mp.processUpdate(state);
        mp.renewCallback();
      } else {
        trace('http error on ' + url + ': ' + req.status);
        trace(req.responseText);
      }
    }
  }
  req.open('POST', url, true);
  //trace("sending update");
  req.send(update);
}

Multiplayer.prototype.processUpdate = function(state) {
  //trace("processing update");
  var letters = state.letters.split('');
  var width = this.widget.crossword.width;
  for (var i = 0; i < letters.length; ++i) {
    var y = parseInt(i / width);
    var x = i % width;
    if (!this.widget.square(x,y))
      continue;
    var newletter = letters[i];
    var ch = newletter.charCodeAt(0);
    this.widget.square(x,y).fill(newletter, (ch >= 97 && ch <= 122))
  }
}

