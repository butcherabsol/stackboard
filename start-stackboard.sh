#!/bin/sh
cd "$(dirname "$0")" || exit 1
printf 'Open http://127.0.0.1:8765/newtab.html in Firefox. Keep this window open.\n'
exec python3 -m http.server 8765 --bind 127.0.0.1 --directory dist
