FROM rabbitmq:3.6.11-management

COPY jwt_plugin/plugins/rabbit_auth_backend_jwt* /plugins
COPY jwt_plugin/plugins/jwt* /plugins
COPY jwt_plugin/plugins/jsx* /plugins
COPY jwt_plugin/plugins/base64url* /plugins

RUN rabbitmq-plugins enable --offline rabbitmq_management rabbitmq_web_mqtt

EXPOSE 4369 5671 5672 25672 15671 15672 15675

CMD ["rabbitmq-server"]
