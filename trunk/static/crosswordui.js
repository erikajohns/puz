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


// Constructor.
function CrosswordWidget() {
  // Whether input is in left-to-right or top-to-bottom mode.
  this.direction_horiz = true;

  // Which square has the input focus.
  this.focused = undefined;

  // Which squares are currently highlighted.
  this.highlighted = [];
};

CrosswordWidget.prototype.loadCrossword = function(crossword) {
  var widget = this;

  document.onkeypress = function(e) {
    return widget.keyPress(e);
  };

  this.crossword = crossword;

  var table = document.createElement('table');
  table.id = 'crosswordui';
  table.cellPadding = 0;
  table.cellSpacing = 0;

  var tbody = document.createElement('tbody');

  for (var y = 0; y < crossword.height; ++y) {
    var tr = document.createElement('tr');
    for (var x = 0; x < crossword.width; ++x) {
      var answer = crossword.answer.substr(y*crossword.width + x, 1);
      if (answer != ".") {
        var square = new Square(this, x, y, answer, crossword.numbers[y][x]);
        tr.appendChild(square.td);
      } else {
        var td = document.createElement('td');
        td.className = 'filled';
        tr.appendChild(td);
      }
    }
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  this.tbody = tbody;

  this.focus = document.createElement('focus');
  this.focus.className = 'focus';

  return table;
};

// Return the square at (x, y).
CrosswordWidget.prototype.square = function(x, y) {
  return this.tbody.childNodes[y].childNodes[x].square;
}

// Focus the clues for the passed-in square.
CrosswordWidget.prototype.focusClues = function(square) {
  if (this.highlightCallback) {
    this.highlightCallback(
      this.getNumber(square, true), this.getNumber(square, false));
  }
}

// Change the focus to the given target square.
CrosswordWidget.prototype.setFocus = function(target, flip_if_focused) {
  if (!target) return;
  if (this.focused == target) {
    if (flip_if_focused)
      this.direction_horiz = !this.direction_horiz;
    this.highlightRegion(target);
  } else {
    this.focused = target;
    target.letter.appendChild(this.focus);
    // Only redo the highlighting if necessary.
    if (target.td.className != 'highlighted')
      this.highlightRegion(target);
  }
  this.focusClues(target);
};

// Starting at square, move the focus by (dx,dy), stopping at the edge
// of the puzzle (and skipping over empty squares if skip == true).
CrosswordWidget.prototype.focusNext = function(square, dx, dy, skip) {
  var x = square.x;
  var y = square.y;

  x += dx; y += dy;
  while (x >= 0 && y >= 0 && x < this.crossword.width && y < this.crossword.height) {
    square = this.square(x,y);
    if (square) {
      this.setFocus(square, false);
      return;
    }
    if (!skip) return;
    x += dx; y += dy;
  }
};

CrosswordWidget.prototype.changeSquareHighlight = function(square, highlight) {
  if (highlight) {
    square.td.className = 'highlighted';
  } else {
    square.td.className = '';
  }
};

// Get the square at the start or end of the passed-in square's word.
CrosswordWidget.prototype.getStartSquare =
    function(square, direction_horiz, is_start) {
  var dx = direction_horiz ? 1 : 0;
  var dy = direction_horiz ? 0 : 1;
  if (is_start) { dx *= -1; dy *= -1; }

  var x = square.x, y = square.y;
  while (x >= 0 && y >= 0 &&
         x < this.crossword.width && y < this.crossword.height &&
         this.square(x,y)) {
    h = this.square(x,y);
    x += dx; y += dy;
  }
  return h;
};

// Get the word number of the passed-in square.
CrosswordWidget.prototype.getNumber = function(square, direction_horiz) {
  return this.getStartSquare(square, direction_horiz, true).number;
};

// Starting at square, highlight all squares that are within the
// current clue (as determined by the current input direction).
CrosswordWidget.prototype.highlightRegion = function(square) {
  // unhighlight existing highlights...
  for (var i = 0; i < this.highlighted.length; ++i)
    this.changeSquareHighlight(this.highlighted[i], false);
  this.highlighted = [];

  if (square) {
    this.highlighted = [];

    var h = this.getStartSquare(square, this.direction_horiz, true);
    var end = this.getStartSquare(square, this.direction_horiz, false);
    var dx = this.direction_horiz ? 1 : 0;
    var dy = this.direction_horiz ? 0 : 1;

    do {
      this.highlighted.push(h);
      this.changeSquareHighlight(h, true);
    } while (h.x + dx <= end.x && h.y + dy <= end.y &&
             (h = this.square(h.x + dx, h.y + dy)));
  }
};

// Get the next or previous square, skipping blanks and wrapping around the
// board if necessary.
CrosswordWidget.prototype.getNextSquare = function(square, is_next) {
  var dx = is_next ? 1 : -1;
  var dy = is_next ? 1 : -1;
  var x = square.x + dx;
  var y = square.y;
  if (x < 0) { x = this.crossword.width + x; y--; }
  if (x >= this.crossword.width) { x %= this.crossword.width; y++; }

  for (; y >= 0 && y < this.crossword.height;
       y += dy, x = is_next ? 0 : this.crossword.width - 1) {
    for (; x >= 0 && x < this.crossword.width; x += dx) {
      square = this.square(x, y);
      if (square) return square;
    }
  }
  return undefined;
}

// Get the first square of the next or previous word.
CrosswordWidget.prototype.getNextWord =
    function(square, direction_horiz, is_next) {
  if (direction_horiz == true) {
    // To find the next horizontal word, we move to the end of the current
    // word and then walk forward across the board until we find a
    // non-black square.
    square = this.getStartSquare(square, true, !is_next);
    square = this.getNextSquare(square, is_next);
    if (!square) return undefined;
    return this.getStartSquare(square, true, true);
  } else {
    // To find the next vertical word, we move to the beginning of the
    // current word and walk forward across the board until we find a
    // non-black square that is on the top row or has a black square above
    // it.
    square = this.getStartSquare(square, false, true);
    while (square = this.getNextSquare(square, is_next)) {
      if (square.y == 0 || !this.square(square.x, square.y - 1)) {
        return square;
      }
    }
    return undefined;
  }
}

CrosswordWidget.prototype.keyPress = function(e) {
  if (!this.focused) return true;

  if (!e) e = window.event;
  // don't eat ctl-r and friends...
  if (e.altKey || e.ctrlKey || e.metaKey)
    return true;

  var square = this.focused;

  var code;
  if (e.keyCode) code = e.keyCode;
  else if (e.which) code = e.which;

  // The crazy-looking key codes (63xxx) are for Safari.
  if (code == 9) { // tab
    this.setFocus(
      this.getNextWord(square, this.direction_horiz, !e.shiftKey), false);
  } else if (code == 35 || code == 63275) { // end
    this.setFocus(
      this.getStartSquare(square, this.direction_horiz, false), false);
  } else if (code == 36 || code == 63273) { // home
    this.setFocus(
      this.getStartSquare(square, this.direction_horiz, true), false);
  } else if (code == 37 || code == 63234) { // left
    this.focusNext(square, -1, 0, true);
  } else if (code == 38 || code == 63232) { // up
    this.focusNext(square, 0, -1, true);
  } else if (code == 39 || code == 63235) { // right
    this.focusNext(square, 1, 0, true);
  } else if (code == 40 || code == 63233) { // down
    this.focusNext(square, 0, 1, true);
  } else if (code == 32) { // space
    this.direction_horiz = !this.direction_horiz;
    this.focusClues(square);
    this.highlightRegion(square);
  } else if (code == 8) { // backspace
    square.fill('', false);
    if (this.direction_horiz)
      this.focusNext(square, -1, 0, false);
    else
      this.focusNext(square, 0, -1, false);
    if (this.onChanged)
      this.onChanged(square.x, square.y, ' ');
  } else if (code == 46) { // delete
    square.fill('', false);
    if (this.onChanged)
      this.onChanged(square.x, square.y, ' ');
  } else if (code >= 97 && code <= 122 ||
             code >= 65 && code <= 90) { // letter
             // FIXME(derat): isalpha?
    var str = String.fromCharCode(code);
    square.fill(str.toUpperCase(), code >= 65 && code <= 90 ? true : false);
    if (this.onChanged)
      this.onChanged(square.x, square.y, str);
    if (this.direction_horiz)
      this.focusNext(square, 1, 0, false);
    else
      this.focusNext(square, 0, 1, false);
    // If this word is done, move on to the next one.
    if (this.focused == square)
      this.setFocus(
        this.getNextWord(square, this.direction_horiz, true), false);
  } else {
    return true;
  }
  return false;
};

CrosswordWidget.prototype.selectByClue = function(horiz, number) {
  this.direction_horiz = horiz;
  for (var y = 0; y < this.crossword.height; ++y) {
    for (var x = 0; x < this.crossword.width; ++x) {
      var square = this.square(x,y);
      if (square && square.number == number) {
        this.setFocus(square, false);
        return;
      }
    }
  }
};

// Constructor for our per-square data.
Square = function(widget, x, y, letter, number) {
  this.x = x;
  this.y = y;
  this.answer = letter;
  this.number = number;

  var square = this;
  this.td = document.createElement('td');
  this.td.square = this;   // this is probably bad for IE...  *shrug*
  this.td.onmousedown = function() { widget.setFocus(this.square, true); };

  this.answer = letter;

  if (number != 0) {
    var numberdiv = document.createElement('div');
    numberdiv.className = 'number';
    numberdiv.appendChild(document.createTextNode(number));
    this.td.appendChild(numberdiv);
  }

  this.letter = document.createElement('div');
  this.letter.className = 'letter';
  // We also create a plain text node and call it "text".
  // We'd like to do that right here, but Safari disappears the text node
  // if it's created empty.  So we instead create it lazily below.
  this.letter.text = undefined;  //(document.createTextNode(' '));
  this.td.appendChild(this.letter);
};

Square.prototype.fill = function(letter, is_guess) {
  // We create letter.text lazily, but must be careful to never create
  // one that's empty, because otherwise Safari will never show it.  :(
  if (letter == '' || letter == ' ') {  // erasing
    if (this.letter.text)
      this.letter.text.data = '';
    return;
  }

  this.letter.className = 'letter' + (is_guess ? ' guess' : '');
  letter = letter.toUpperCase();
  if (!this.letter.text) {
    this.letter.text = document.createTextNode(letter);
    this.letter.appendChild(this.letter.text);
  }
  if (this.letter.text.data != letter)
    this.letter.text.data = letter;
};

// vim: set ts=2 sw=2 et ai :
