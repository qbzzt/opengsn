#! /bin/bash

browserify etherless.js | tr -dc '\0-\177' > bundle.js
mv bundle.js ~/html
cp etherless.html ~/html

echo Done at
date
