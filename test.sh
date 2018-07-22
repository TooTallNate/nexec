#!/bin/bash
set -euo pipefail
test -f "$HOME/.import.sh" || curl -sfS https://import.pw > "$HOME/.import.sh"
source "$HOME/.import.sh"

source ./nexec.sh
import "import.pw/assert@2.1.2"

assert_equal "$(nexec whoami)" nobody
assert_equal "$(nexec pwd)" /etc/bashttpd
