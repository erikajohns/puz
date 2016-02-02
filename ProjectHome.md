Across Lite is crossword software used by sites like the New York Times for distributing crosswords.

## File Format ##
The file format was not documented anywhere, which meant third-party software could neither read nor produce Across Lite files.  So the primary output of this project is the [file format documentation](FileFormat.md).

Some implementations that consume or produce these files:
  * libpuz (C, GPL): see below
  * rubypuz (Ruby, MIT): http://neugierig.org/software/ruby/rubypuz/
  * puzhs (Haskell bindings for libpuz, GPL and MIT): http://hackage.haskell.org/package/hpuz

## `libpuz` ##

`libpuz` is a C library for reading and writing Across Lite's .puz files.  The library is relatively stable and in current use.  The latest version is available from the [downloads section](http://code.google.com/p/puz/downloads).  Older versions are available at: http://www.joshisanerd.com/puz/.  Haskell bindings for the library are available from a different page, see above.

## DHTML Crosswords ##
We've also built a rudimentary web-based multiplayer server for solving crosswords with your friends.  Have you ever worked on a crossword in the same newspaper, sharing a pen?  It's sorta like that except everyone can type at the same time.

It's not nearly complete but it is playable and can be pulled from [the subversion repository](http://code.google.com/p/puz/source).