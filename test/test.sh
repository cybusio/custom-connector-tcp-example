#!/usr/bin/env bash

# Make sure the script runs in the directory in which it is placed
DIR=$(dirname `[[ $0 = /* ]] && echo "$0" || echo "$PWD/${0#./}"`)
cd $DIR

# Create a unique project name
PROJECT=ci-`uuidgen | tr "[:upper:]" "[:lower:]"`
export COMPOSE_PROJECT_NAME=${PROJECT}

# kill and remove any running containers
cleanup () {
  docker-compose --compatibility kill
  docker-compose --compatibility down
}
# catch unexpected failures, do cleanup and output an error message
trap 'cleanup ; printf "Tests Failed For Unexpected Reasons\n"'\
  HUP INT QUIT PIPE TERM

# run the composed services
docker-compose build && docker-compose --compatibility up -d
if [ $? -ne 0 ] ; then
  printf "Docker Compose Failed\n"
  cleanup
  exit -1
fi

docker-compose logs -f

NONE_ZERO_EXIT_CONTAINER_COUNT=`docker-compose ps --status exited | tail -n 1 | grep -v "exited (0)" | wc -l`

cleanup

if [ "$NONE_ZERO_EXIT_CONTAINER_COUNT" -ne 0 ] ; then
  printf "Tests Failed\n"
  exit 1
else
  printf "Tests Passed\n"
  exit 0
fi
