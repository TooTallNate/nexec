#!/bin/bash
import "querystring@1.2.0"

# Amount of seconds that the command may run for before being killed
timeout="10"

handler() {
  path="$(jq -r '.path' < "$REQUEST")"
  pathname="$(cut -f1 -d"?" <<< "$path")"
  command="$(querystring_unescape "$(sed 's|^/*api/||' <<< "$pathname")")"
  query_start="$(( ${#pathname} + 1 ))"
  querystring="${path:$query_start}"
  #echo "$path"
  #echo "$pathname"
  #echo "$command"
  #echo "$querystring"
  #return

  http_response_header "X-Cmd" "$command"
  http_response_header "Access-Control-Allow-Origin" "*"

  saveIFS="$IFS"
  IFS='=&'
  query=($querystring)
  IFS="$saveIFS"

  stdin=
  stdin_fd=
  stdin_url=
  print_exit=0
  args=()
  for ((i=0; i<${#query[@]}; i+=2)); do
    query_name="$(querystring_unescape "${query[i]}")"
    query_value="$(querystring_unescape "${query[i+1]}")"
    if [ "${query_name}" = "arg" ]; then
      args+=("${query_value}")
    elif [ "${query_name}" = "exit" ]; then
      print_exit=1
    elif [ "${query_name}" = "stdin" ]; then
      stdin="${query_value}"
    elif [ "${query_name}" = "stdin_url" ]; then
      stdin_url="${query_value}"
    fi
  done

  if [ ! -z "${stdin_url}" ]; then
    exec {stdin_fd}< <(curl "${stdin_url}" --silent --show-error --no-buffer 2>&1)
  elif [ ! -z "${stdin}" ]; then
    exec {stdin_fd}< <(printf "${stdin}")
  fi

  if [ ! -z "${stdin_fd}" ]; then
    # Close HTTP request body stdin,
    # and redirect stdin to be the from the stdin query arg
    exec <&-
    exec <&$stdin_fd
  fi

  set +e
  exit_code=0
  echo timeout "${timeout}" "${command}" ${args[@]+"${args[@]}"} 2>&1 || exit_code=$?
  #echo "Exit code: ${exit_code}"
  set -e

  if [ "${exit_code}" = 143 ]; then
    echo "Command timed out (${timeout}s): ${command} ${args[*]}"
  fi

  if [ "${print_exit}" -eq 1 ]; then
    echo "${exit_code}"
  fi

  return 0
}
