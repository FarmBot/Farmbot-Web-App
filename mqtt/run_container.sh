#!/bin/bash
JWT_PLUGIN_DIR=./jwt_plugin

EXIT_VALUE=0

HELP="""
OPTIONS
    -r Remove run docker rmi
    -b Build the plugin.
    -n Don't run docker.
    -c Rebuild the image.
"""
usage() { echo "($#) Usage: $0 [options] $HELP" 1>&2; exit 1; }

check_exit() {
  if [ "$EXIT_VALUE" != "0" ]; then
    echo "Exiting!"
    exit $EXIT_VALUE
  fi
}

check_built() {
  echo "Checking the thing is built!"
  sudo docker images | grep "farmbot-rabbit"
  if [ "$?" == "1" ]; then
    sudo docker build -t farmbot-rabbit .
    EXIT_VALUE=$?
  fi
}

make_plugin() {
  echo "Making Plugin..."
  CUR_DIR=$PWD
  cd $JWT_PLUGIN_DIR
  make dist
  EXIT_VALUE=$?
  cd $PWD
}

docker_rm() {
  echo "Running docker rm..."
  sudo docker rm farmbot-rabbit --force
  EXIT_VALUE=$?
}

docker_rmi() {
  echo "Running docker rmi..."
  sudo docker rmi farmbot-rabbit --force
  EXIT_VALUE=$?
}

docker_run() {
  cat the_badge.txt
  check_built
  check_exit
  sudo docker run                           \
       -e WEB_API_URL=http://localhost:3000 \
       -p 15672:15672                       \
       -p 5672:5672                         \
       -p 3002:15675                        \
       -p 8883:8883                         \
       -p 1883:1883                         \
       --hostname farmbot-rabbit               \
       --name farmbot-rabbit                   \
       -v $(pwd)/conf:/etc/rabbitmq         \
       -v $(pwd)/rabbitmq:/var/lib/rabbitmq \
       farmbot-rabbit
}

docker_rm
while getopts ":brnc" opt; do
  case $opt in
    b)
      make_plugin
      check_exit
      ;;
    r)
      docker_rmi
      ;;
    c)
      docker_rmi
      check_built
      ;;
    n)
      exit 0
      ;;
    *)
      usage
      ;;
  esac
done

docker_run
echo "Goodbye"
exit $?
