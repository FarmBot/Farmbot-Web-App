module Api
  class RmqUtilsController < Api::AbstractController

    # The only valid format for AMQP / MQTT topics.
    # Prevents a whole host of abuse / security issues.
    TOPIC_REGEX = \
      /(bot\.device_)\d*\.(from_clients|from_device|logs|status|sync)\.?.*/
    MALFORMED_TOPIC = "malformed topic. Must match #{TOPIC_REGEX.inspect}"
    ALL = [:user, :vhost, :resource, :topic]
    skip_before_action :check_fbos_version, only: ALL
    skip_before_action :authenticate_user!, only: ALL

    before_action :scrutinize_topic_string

    def user
      (username == "guest") ? deny : allow
    end

    def vhost
      # binding.pry
      allow
    end

    def resource
      puts params
      # binding.pry
      allow
    end

    def topic
      # binding.pry
      allow
    end

  private

    def deny
      render json: "deny"
    end

    def allow
      render json: "allow"
    end

    def username
      @username ||= params["username"]
    end

    def password
      @password ||= params["password"]
    end

    def routing_key
      @routing_key ||= params["routing_key"]
    end

    def scrutinize_topic_string
      is_ok = routing_key ? !!TOPIC_REGEX.match(routing_key) : true
      render json: MALFORMED_TOPIC, status: 422 unless is_ok
    end

    def routing_key_id
      routing_key                # "bot.device_9.logs"
        .gsub("bot.device_", "") # "9.logs"
        .split(".")              # ["9", "logs"]
        .first                   # "9"
        .to_i || 0               # 9
    end
  end
end
