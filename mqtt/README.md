# Work In Progress

Replacing the current MQTT broker with RabbitMQ.

# Table of Contents

 * `Dockerfile`: The important thing.
 * `jwt_plugin`: The plugin for auth.

# Build

```
cd jwt_plugin; make; make dist; cd ..
sudo docker build -t some-rabbit .

```

# Run (Fish Shell Users)

```

sudo docker run                       \
  -e WEB_API_URL=localhost:3000       \
  -p 15672:15672                      \
  -p 5672:5672                        \
  -p 3002:15675                       \
  -p 8883:8883                        \
  -p 1883:1883                        \
  --hostname some-rabbit              \
  --name some-rabbit                  \
  -v (pwd)/conf:/etc/rabbitmq         \
  -v (pwd)/rabbitmq:/var/lib/rabbitmq \
  some-rabbit

```

# Teardown

```
sudo docker rm some-rabbit
```

# Debug (Bash)

```
sudo docker exec -i -t some-rabbit /bin/bash
```
