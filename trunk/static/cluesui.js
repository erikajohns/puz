// Crossword Javascript
// Copyright (c) 2005 Evan Martin <martine@danga.com>

// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
// BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE. 


function CluesBox(title, clues) {
  var container = document.createElement('div');
  container.className = 'crosswordclues';

  var heading = document.createElement('h2')
  heading.appendChild(document.createTextNode(title.toUpperCase()));
  container.appendChild(heading);

  var scroller = document.createElement('div');
  scroller.style.overflow = 'auto';
  scroller.frameborder = 0;
  scroller.className = 'scroller';
  this.scroller = scroller;
  var i;
  this.divs = {};
  for (i = 0; i < clues.length; ++i) {
    var number = clues[i][0];
    var entrylink = document.createElement('a');
    entrylink.href = '#';
    entrylink.direction = title == 'across';
    entrylink.number = number;
    entrylink.onclick = function() {
      CrosswordUI.selectByClue(this.direction, this.number);
    };
    entrylink.innerHTML = number + ' ' + clues[i][1];

    var entry = document.createElement('div');
    entry.appendChild(entrylink);

    scroller.appendChild(entry);
    this.divs[number] = entry;
  }
  container.appendChild(scroller);

  this.container = container;
};

CluesBox.prototype.unhighlight = function() {
  if (this.highlighted) {
    this.highlighted.className = '';
    this.highlighted = 0;
  }
}

CluesBox.prototype.scrollTo = function(number) {
  if (!this.divs[number])
    return;
  var clue = this.divs[number];
  var offset = clue.offsetTop - this.scroller.offsetTop;
  this.scroller.scrollTop = offset;
  this.unhighlight();
  clue.className = 'highlighted';
  this.highlighted = clue;
}

var CluesUI = {
  selectCallback: undefined,

  create: function(crossword) {
    var container = document.createElement('div');
    CluesUI.across = new CluesBox("across", crossword.across);
    container.appendChild(CluesUI.across.container);
    CluesUI.down = new CluesBox("down", crossword.down);
    container.appendChild(CluesUI.down.container);
    return container;
  }
};

// vim: set ts=2 sw=2 et :
