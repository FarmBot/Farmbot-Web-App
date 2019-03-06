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
      nerves_hub
      from_clients
      from_device
      logs
      status
      status_v8
      sync
      resources_v0
      from_api
      \\#
      \\*
    ).map { |x| x + "(\\.|\\z)" }.join("|")

    # The only valid format for AMQP / MQTT topics.
    # Prevents a whole host of abuse / security issues.
    TOPIC_REGEX = Regexp.new("bot\\.device_\\d*\\.(#{BOT_CHANNELS})")

    MALFORMED_TOPIC = "malformed topic. Must match #{TOPIC_REGEX.inspect}"
    ALL = [:user, :vhost, :resource, :topic]
    VHOST = ENV.fetch("MQTT_VHOST") { "/" }
    RESOURCES = ["queue", "exchange"]
    PERMISSIONS = ["configure", "read", "write"]
    skip_before_action :check_fbos_version, except: []
    skip_before_action :authenticate_user!, except: []

    before_action :scrutinize_topic_string
    before_action :always_allow_admin, except: [:user]

    def user # Session entrypoint - Part I
      # Example JSON:
      #   "username"  => "foo@bar.com",
      #   "password"  => "******",
      #   "vhost"     => "/",
      #   "client_id" => "MQTT_FX_Client",
      case username
      when "guest" then deny
      when "admin" then authenticate_admin
      else; device_id_in_username == current_device.id ? allow : deny       end
    end

    def vhost # Session entrypoint - Part II
      # Example JSON:
      #   "username" => "admin",
      #   "vhost"    => "/",
      #   "ip"       => "::ffff:172.23.0.1",
      vhost == VHOST ? allow : deny
    end

    def resource
      # Example JSON:
      #   "username"   => "admin",
      #   "vhost"      => "/",
      #   "resource"   => "queue",
      #   "name"       => "mqtt-subscription-MQTT_FX_Clientqos0",
      #   "permission" => "configure",
      ok = RESOURCES.include?(resource) && PERMISSIONS.include?(permission)
      ok ? allow : deny
    end

    def topic # Called during subscribe
      # Example JSON:
      #   "name"        => "amq.topic",
      #   "permission"  => "read",
      #   "resource"    => "topic",
      #   "routing_key" => "from_api",
      #   "username"    => "admin",
      #   "vhost"       => "/",
      device_id_in_topic == device_id_in_username ? allow : deny
    end

    private

    def always_allow_admin
      allow if admin?
    end

    def admin?
      username == "admin"
    end

    def authenticate_admin
      correct_pw = password == ENV.fetch("ADMIN_PASSWORD")
      ok = admin? && correct_pw
      ok ? allow("management", "administrator") : deny
    end

    def deny
      render json: "deny", status: 403
    end

    def allow(*tags)
      render json: (["allow"] + tags).join(" ")
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

    def vhost
      @vhost ||= params["vhost"]
    end

    def resource
      @resource ||= params["resource"]
    end

    def permission
      @permission ||= params["permission"]
    end

    def scrutinize_topic_string
      return if admin?
      is_ok = routing_key ? !!TOPIC_REGEX.match(routing_key) : true
      render json: MALFORMED_TOPIC, status: 422 unless is_ok
    end

    def device_id_in_topic
      (routing_key || "") # "bot.device_9.logs"
        .gsub("bot.device_", "") # "9.logs"
        .split(".") # ["9", "logs"]
        .first # "9"
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
