#! /bin/bash

browserify etherless.js | tr -dc '\0-\177' > bundle.js
mv bundle.js /var/www/html
cp etherless.html /var/www/html

echo Done at
date
