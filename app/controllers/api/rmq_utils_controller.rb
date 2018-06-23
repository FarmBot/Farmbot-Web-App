module Api
  class RmqUtilsController < Api::AbstractController
    # The only valid format for AMQP / MQTT topics.
    # Prevents a whole host of abuse / security issues.
    TOPIC_REGEX     = \
      /(bot\.device_)\d*\.(from_clients|from_device|logs|status|sync)\.?.*/
    MALFORMED_TOPIC = "malformed topic. Must match #{TOPIC_REGEX.inspect}"
    ALL             = [:user, :vhost, :resource, :topic]
    VHOST           = ENV.fetch("MQTT_VHOST") { "/" }
    RESOURCES       = ["queue", "exchange"]
    PERMISSIONS     = ["configure", "read", "write"]
    skip_before_action :check_fbos_version, only: ALL
    skip_before_action :authenticate_user!, only: ALL

    before_action :scrutinize_topic_string

    def user
      case username
      when "guest" then deny
      when "admin" then authenticate_admin
      else
        if device_id_in_username == current_device.id
          allow
        else
          deny
        end
      end
    end

    def vhost
      if (params["vhost"] == VHOST)
        allow
      else
        deny
      end
    end

    def resource
      res, perm = [params["resource"], params["permission"]]
      ok        = RESOURCES.include?(res) && PERMISSIONS.include?(perm)
      if ok
        allow
      else
        deny
      end
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
      if is_admin && correct_pw
        allow
      else
        deny
      end
    end

    def deny
      render json: "deny", status: 403
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
      (routing_key || "")        # "bot.device_9.logs"
        .gsub("bot.device_", "") # "9.logs"
        .split(".")              # ["9", "logs"]
        .first                   # "9"
        .to_i || 0               # 9
    end

    def current_device
      @current_device ||= Auth::FromJWT.run!(jwt: password).device
    rescue Mutations::ValidationException => e
      raise JWT::VerificationError, "RMQ Provided bad token"
    end

    def device_id_in_username
      @device_id ||= username.gsub("device_", "").to_i
    end
  end
end
