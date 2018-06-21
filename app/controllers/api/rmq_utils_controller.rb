module Api
  class RmqUtilsController < Api::AbstractController
    TOPIC_REGEX     = \
      /(bot\.device_)\d*\.(from_clients|from_device|logs|status|sync)\.?.*/
    # The only valid format for AMQP / MQTT topics.
    # Prevents a whole host of abuse / security issues.
    MALFORMED_TOPIC = "malformed topic. Must match #{TOPIC_REGEX.inspect}"
    ALL             = [:user, :vhost, :resource, :topic]
    VHOST           = ENV.fetch("MQTT_VHOST") { "/" }

    skip_before_action :check_fbos_version, only: ALL
    skip_before_action :authenticate_user!, only: ALL

    before_action :scrutinize_topic_string

    def user
      case username
      when "guest" then deny
      when "admin" then authenticate_admin
      else; device_id_in_username == current_device.id ? allow : deny
      end
    end

    def vhost
      (params["vhost"] == VHOST) ? allow : deny
    end

    def resource
      ok = ["queue", "exchange"].include?(params["resource"]) &&
           ["configure", "read", "write"].include?(params["permission"])
      ok ? allow : deny
    end

    def topic
      device_id_in_topic == device_id_in_username ? allow : deny
    end

  private

    def is_admin
      username == "admin"
    end

    def authenticate_admin
      correct_pw = password == ENV.fetch("ADMIN_PASSWORD")
      (is_admin && correct_pw) ? allow : deny
    end

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
      return if is_admin
      is_ok = routing_key ? !!TOPIC_REGEX.match(routing_key) : true
      render json: MALFORMED_TOPIC, status: 422 unless is_ok
    end

    def device_id_in_topic
      routing_key                # "bot.device_9.logs"
        .gsub("bot.device_", "") # "9.logs"
        .split(".")              # ["9", "logs"]
        .first                   # "9"
        .to_i || 0               # 9
    end

    def current_device
      @current_device ||= Auth::FromJWT.run!(jwt: password).device
    end

    def device_id_in_username
      @device_id ||= username.gsub("device_", "").to_i
    end
  end
end
