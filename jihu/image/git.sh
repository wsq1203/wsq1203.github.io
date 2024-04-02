#!/bin/bash
git add --all
git commit -m "images"
expect -c "
spawn /usr/bin/git push --all
expect \"Username for 'https://jihulab.com':\"
send \"wsq1203\r\"
expect \"Password for 'https://wsq1203@jihulab.com':\"
send \"QAZwsx123.\r\"
expect eof
"
