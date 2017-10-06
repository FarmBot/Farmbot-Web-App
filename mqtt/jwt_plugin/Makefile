PROJECT = rabbit_auth_backend_jwt
PROJECT_DESCRIPTION = RabbitMQ JSON Web token authorization
PROJECT_MOD = rabbit_auth_backend_jwt_app

define PROJECT_ENV
[

]
endef

define PROJECT_APP_EXTRA_KEYS
	{broker_version_requirements, []}
endef

LOCAL_DEPS = inets
DEPS = rabbit_common rabbit amqp_client jwt

DEP_EARLY_PLUGINS = rabbit_common/mk/rabbitmq-early-plugin.mk
DEP_PLUGINS = rabbit_common/mk/rabbitmq-plugin.mk

# FIXME: Use erlang.mk patched for RabbitMQ, while waiting for PRs to be
# reviewed and merged.

ERLANG_MK_REPO = https://github.com/rabbitmq/erlang.mk.git
ERLANG_MK_COMMIT = rabbitmq-tmp

include rabbitmq-components.mk
include erlang.mk
