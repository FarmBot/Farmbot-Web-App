module Api
  # When RabbitMQ gets a connection, it will check in with the API to make sure
  # the user is allowed to perform the action.
  # Returning "allow" will allow them to perform the requested action.
  # Any other response results in denial.
  # Results are cached for 10 minutes to prevent too many requests to the API.
  class RmqUtilsController < Api::AbstractController
    # List of AMQP/MQTT topics we support in the following format:
    # "bot.device_123.<MAIN TOPIC HERE>"
    BOT_CHANNELS = %w(
      from_api
      from_clients
      from_device
      logs
      nerves_hub
      ping
      pong
      resources_v0
      status
      status_v8
      sync
      \\#
      \\*
    ).map { |x| x + "(\\.|\\z)" }.join("|")

    # The only valid format for AMQP / MQTT topics.
    # Prevents a whole host of abuse / security issues.
    DEVICE_SPECIFIC_CHANNELS =
      Regexp.new("bot\\.device_\\d*\\.(#{BOT_CHANNELS})")
    PUBLIC_BROADCAST = "public_broadcast"
    PUBLIC_CHANNELS = ["", ".*", ".#"].map { |x| PUBLIC_BROADCAST + x }

    MALFORMED_TOPIC = "malformed topic. Must match #{DEVICE_SPECIFIC_CHANNELS.inspect}"
    VHOST = ENV.fetch("MQTT_VHOST") { "/" }
    RESOURCES = ["queue", "exchange"]
    PERMISSIONS = ["configure", "read", "write"]
    FARMBOT_GUEST_USER = "farmbot_guest"
    GUEST_REGISTRY_ROOT = "guest_registry"

    class PasswordFailure < Exception; end

    rescue_from PasswordFailure, with: :report_suspicious_behavior

    skip_before_action :check_fbos_version, except: []
    skip_before_action :authenticate_user!, except: []

    before_action :always_allow_admin, except: [:user_action]

    def user_action # Session entrypoint - Part I
      # Example JSON:
      #   "username"  => "foo@bar.com",
      #   "password"  => "******",
      #   "vhost"     => "/",
      #   "client_id" => "MQTT_FX_Client",
      case username_param
      # NOTE: "guest" is not the same as "farmbot_guest".
      #       We intentionally differentiate the
      #       two types to avoid accidental
      #       security issues. -RC
      when "guest" then deny
      when FARMBOT_GUEST_USER then allow
      when "admin" then authenticate_admin
      else
        device_id_in_username == current_device.id ? allow : deny
      end
    end

    def vhost_action # Session entrypoint - Part II
      # Example JSON:
      #   "username" => "admin",
      #   "vhost"    => "/",
      #   "ip"       => "::ffff:172.23.0.1",
      vhost_param == VHOST ? allow : deny
    end

    def resource_action
      # Example JSON:
      #   "username"   => "admin",
      #   "vhost"      => "/",
      #   "resource"   => "queue",
      #   "name"       => "mqtt-subscription-MQTT_FX_Clientqos0",
      #   "permission" => "configure",
      ok = RESOURCES.include?(resource_param) && PERMISSIONS.include?(permission_param)
      ok ? allow : deny
    end

    def topic_action # Called during subscribe
      # Example JSON:
      #   "name"        => "amq.topic",
      #   "permission"  => "read",
      #   "resource"    => "topic",
      #   "routing_key" => "from_api",
      #   "username"    => "admin",
      #   "vhost"       => "/",
      case routing_key_param
      when *PUBLIC_CHANNELS
        permission_param == "read" ? allow : deny
      else
        if_topic_is_safe do
          device_id_in_topic == device_id_in_username ? allow : deny
        end
      end
    end

    private

    def always_allow_admin
      raise "NEVER" if action_name == "user" # Security failsafe
      allow if admin?
    end

    def farmbot_guest?
      username_param == FARMBOT_GUEST_USER
    end

    def admin?
      username_param == "admin"
    end

    def authenticate_admin
      correct_pw = password_param == admin_password
      ok = admin? && correct_pw
      if ok
        allow("management", "administrator")
      else
        raise PasswordFailure
      end
    end

    def admin_password
      @admin_password ||= ENV.fetch("ADMIN_PASSWORD")
    rescue KeyError
      raise PasswordFailure
    end

    def report_suspicious_behavior
      Rollbar.error("Failed password attempt on  RMQ: " + password_param)
      deny
    end

    def deny
      puts "==== #{action_name} ===="
      pp params
      render json: "deny", status: 403
    end

    def allow(*tags)
      render json: (["allow"] + tags).join(" ")
    end

    def username_param
      @username ||= params["username"]
    end

    def password_param
      @password ||= params["password"]
    end

    def routing_key_param
      @routing_key ||= params["routing_key"]
    end

    def vhost_param
      @vhost ||= params["vhost"]
    end

    def resource_param
      @resource ||= params["resource"]
    end

    def permission_param
      @permission ||= params["permission"]
    end

    def if_topic_is_safe
      if !!DEVICE_SPECIFIC_CHANNELS.match(routing_key_param)
        yield
        return
      end

      if farmbot_guest?
        a, b, c = routing_key_param.split(".")
        if a == GUEST_REGISTRY_ROOT
          puts "=========="
          if !b.include?("*")
            if !b.include?("#")
              if c == nil
                yield
              end
            end
          end
        end
        return
      end

      render json: MALFORMED_TOPIC, status: 422
    end

    def device_id_in_topic
      (routing_key_param || "") # "bot.device_9.logs"
        .gsub("bot.device_", "") # "9.logs"
        .split(".") # ["9", "logs"]
        .first # "9"
        .to_i || 0 # 9
    end

    def current_device
      @current_device ||= Auth::FromJWT.run!(jwt: password_param).device
    rescue Mutations::ValidationException => e
      raise JWT::VerificationError, "RMQ Provided bad token"
    end

    def device_id_in_username
      @device_id ||= username_param.gsub("device_", "").to_i
    end
  end
end
