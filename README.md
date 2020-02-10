# timestamp-converter

Some simple timestamp utilities. Parses:

+ Unix timestamps (milliseconds and seconds)
+ Mongo ID timestamps

## Notes

There's probably a cleverer way to do this using JS modules, or lazy-loading JS files that have side-effects on the copy.

For now, there's a great degree of duplication between `unix.js`/`mongo.js` and `unix.html`/`mongo.html`.
