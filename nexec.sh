import "import.pw/array"
import "import.pw/querystring@1.0.0"

# Runs the given command on the remote server.
#
# Examples:
#   $ nexec ls
#   $ nexec env
#   $ cat foo.sh | nexec bash
#   $ echo '{"foo":"bar"}' | nexec jq -r '.foo'
nexec() {
  local cmd="$(querystring_escape "$1")"
  shift

  local args=("exit=1")
  while [ $# -gt 0 ]; do
    args+=("arg=$(querystring_escape "$1")")
    shift
  done

  local curl_args=("-sS" "--no-buffer")
  if [ ! -t 0 ]; then
    curl_args+=("--data-binary" "@-" "--header" "Transfer-Encoding: chunked")
  fi

  local nexec_host="${NEXEC_HOST-https://nexec.n8.io}"
  local query="$(array_join '&' "${args[@]}")"
  local url="${nexec_host}/${cmd}?${query}"

  # The `curl` command output goes to fd 3
  exec 3< <(curl "${curl_args[@]}" ${NEXEC_CURL_ARGS-} "${url}")

  # fd 4 sends everything except the very last line to stdout
  exec 4> >(awk 'NR>1{print buf}{buf = $0}')

  # The `tee` command dumps the curl output to fd 4,
  # and only the last line goes to the `exit_code` variable
  local exit_code="$(tee <&3 /dev/fd/4 | tail -n 1)"
  #echo "Exit code: '${exit_code}'"
  return "${exit_code}"
}
