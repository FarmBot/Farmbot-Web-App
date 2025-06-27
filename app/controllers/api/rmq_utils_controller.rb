module Api
  # When RabbitMQ gets a connection, it will check in with the API to make sure
  # the user is allowed to perform the action.
  # Returning "allow" will allow them to perform the requested action.
  # Any other response results in denial.
  # Results are cached for 5 minutes to prevent too many requests to the API.
  class RmqUtilsController < Api::AbstractController
    class BrokerConnectionLimiter
      attr_reader :cache

      CACHE_KEY_TPL = "mqtt_limiter:%s"
      TTL = 60 * 5 # Five Minutes
      PER_DEVICE_MAX = 20
      MAX_GUEST_COUNT = 256
      WARNING = "'%s' was rate limited."

      class RateLimit < StandardError; end

      def self.current(cache = Rails.cache.redis)
        self.new(cache)
      end

      def initialize(cache)
        @cache = cache
      end

      def maybe_continue(username)
        is_guest = (username == FARMBOT_DEMO_USER)
        max = is_guest ? MAX_GUEST_COUNT : PER_DEVICE_MAX
        key = CACHE_KEY_TPL % username
        total = (cache.get(key) || "0").to_i
        needs_ttl = cache.ttl(key) < 1
        if total < max
          cache.incr(key)
          cache.expire(key, TTL) if needs_ttl
          yield
        else
          Device.delay.connection_warning(username) if !is_guest
          raise RateLimit, username
        end
      end
    end

    # List of AMQP/MQTT topics we support in the following format:
    # "bot.device_123.<MAIN TOPIC HERE>"
    BOT_CHANNELS = %w(
      from_api
      from_clients
      from_device
      terminal_output
      terminal_input
      logs
      ping
      pong
      status
      sync
      telemetry
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
    FARMBOT_DEMO_USER = "farmbot_demo"
    DEMO_REGISTRY_ROOT = "demos"

    class PasswordFailure < Exception; end

    rescue_from PasswordFailure, with: :report_suspicious_behavior
    rescue_from BrokerConnectionLimiter::RateLimit, with: :do_rate_limit

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
      # NOTE: "guest" is not the same as
      #       "farmbot_demo". We intentionally
      #       differentiate to avoid accidental
      #       security issues. -RC
      when "guest" then deny("Can't use guest account on this server.")
      when "admin" then authenticate_admin
      when FARMBOT_DEMO_USER
        with_rate_limit { allow }
      else
        is_ok = device_id_in_username == current_device.id
        is_ok ? (with_rate_limit { allow }) : deny("Guests are rate limited")
      end
    end

    def vhost_action # Session entrypoint - Part II
      # Example JSON:
      #   "username" => "admin",
      #   "vhost"    => "/",
      #   "ip"       => "::ffff:172.23.0.1",
      vhost_param == VHOST ? allow : deny("Bad vhost")
    end

    def resource_action
      # Example JSON:
      #   "username"   => "admin",
      #   "vhost"      => "/",
      #   "resource"   => "queue",
      #   "name"       => "mqtt-subscription-MQTT_FX_Clientqos0",
      #   "permission" => "configure",
      ok = RESOURCES.include?(resource_param) && PERMISSIONS.include?(permission_param)
      ok ? allow : deny("Bad resource action")
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
        permission_param == "read" ? allow : deny("Topic is read only")
      else
        if_topic_is_safe do
          if device_id_in_topic == device_id_in_username
            allow
          else
            deny("Unsafe topic")
          end
        end
      end
    end

    private

    def always_allow_admin
      raise "NEVER" if action_name == "user" # Security failsafe
      allow if admin?
    end

    def farmbot_demo?
      username_param == FARMBOT_DEMO_USER
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
      deny("Failed password attempt")
    end

    def do_rate_limit
      deny("Device is rate limited")
    end

    def deny(reason)
      maybe_alert_user(reason)
      render json: "deny", status: 403
    end

    def allow(*tags)
      render json: (["allow"] + tags).join(" ")
    end

    def username_param
      @username ||= params.fetch("username")
    end

    def password_param
      @password ||= params.fetch("password")
    end

    def routing_key_param
      @routing_key ||= params.fetch("routing_key")
    end

    def vhost_param
      @vhost ||= params.fetch("vhost")
    end

    def resource_param
      @resource ||= params.fetch("resource")
    end

    def permission_param
      @permission ||= params.fetch("permission")
    end

    def if_topic_is_safe
      if farmbot_demo?
        a, b, c = (routing_key_param || "").split(".")

        if !(permission_param == "read")
          deny("!(permission_param == read)")
          return
        end

        if !(a == DEMO_REGISTRY_ROOT)
          deny("!(a == DEMO_REGISTRY_ROOT)")
          return
        end

        if b.nil?
          deny("b.nil?")
          return
        end

        if b.include?("*")
          deny("b.include?(*)")
          return
        end

        if b.include?("#")
          deny("b.include?(#)")
          return
        end

        if c.present?
          deny("c.present?")
          return
        end

        yield
        return
      end

      # Allow Web SSH access, but only to accounts that have
      # an active `STAFF` token associated with the account.
      # Such tokens exist for 1 week after requesting staff
      # support.
      if routing_key_param.include?(".terminal_input") && permission_param == "write"
        query = { aud: "staff", device_id: device_id_in_topic }
        unless TokenIssuance.where(query).any?
          deny("not_staff")
          return
        end
      end

      if !!DEVICE_SPECIFIC_CHANNELS.match(routing_key_param)
        yield
        return
      end

      msg = "Subscribed to illegal topic #{routing_key_param || ""}"
      maybe_alert_user(msg)

      render json: MALFORMED_TOPIC, status: 422
    end

    def device_id_in_topic
      (routing_key_param || "") # "bot.device_9.logs"
        .gsub("bot.device_", "") # "9.logs"
        .split(".") # ["9", "logs"]
        .first # "9"
        .to_i || 0 # 9
    end

    def with_rate_limit
      # TODO: Replace this with `ThrottlePolicy`.
      BrokerConnectionLimiter
        .current
        .maybe_continue(username_param) { yield }
    end

    def current_device
      @current_device ||= Auth::FromJwt.run!(jwt: password_param).device
    rescue Mutations::ValidationException => e
      raise JWT::VerificationError, "RMQ Provided bad token"
    end

    def device_id_in_username
      @device_id ||= username_param.gsub("device_", "").to_i
    end

    def maybe_alert_user(reason)
      msg = "MQTT ACCESS DENIED #{reason} #{username_param || "unknown"}"
      puts msg unless Rails.env.test?
      if device_id_in_username > 0
        dev = Device.find_by(id: device_id_in_username)
        dev && dev.delay.tell(msg)
      end
    end
  end
end
