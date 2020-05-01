#! /bin/bash

browserify index.js | tr -dc '\0-\177' > bundle.js
mv bundle.js ~/html

echo Done at
date
