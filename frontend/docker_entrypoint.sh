#!/bin/sh -eu
./gen_config.sh >/usr/share/nginx/html/config.js
nginx -g "daemon off;"