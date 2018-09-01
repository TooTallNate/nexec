#!/usr/bin/env import -s bash
set -euo pipefail

source ./nexec.sh
import "assert@2.1.2"

assert_equal "$(nexec whoami)" nobody
assert_equal "$(nexec pwd)" /etc/bashttpd
