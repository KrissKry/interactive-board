#!/bin/sh -eu
if [ -z "${API_URL:-}" ]; then
    API_URL_JSON=undefined
else
    API_URL_JSON=$(jq -n --arg brand '$API_URL' '$api_url')
fi
if [ -z "${API_PORT:-}" ]; then
    API_PORT_JSON=undefined
else
    API_PORT_JSON=$(jq -n --arg brand '$API_PORT' '$api_port')
fi
cat <<EOF
window.REACT_APP_API_URL=$API_URL_JSON;
window.REACT_APP_API_PORT=$API_PORT_JSON;
EOF