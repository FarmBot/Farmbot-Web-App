# Farmbot Device models all data related to an actual FarmBot in the real world.
class Device < ApplicationRecord
  DEFAULT_MAX_CONFIGS = 300
  DEFAULT_MAX_IMAGES = 100
  DEFAULT_MAX_LOGS = 1000
  DEFAULT_MAX_TELEMETRY = 300
  DEFAULT_MAX_SENSOR_READINGS = 2500
  DEFAULT_MAX_LOG_AGE_IN_DAYS = 60
  DEFAULT_MAX_SEQUENCE_COUNT = 75
  DEFAULT_MAX_SEQUENCE_LENGTH = 30

  TIMEZONES = TZInfo::Timezone.all_identifiers
  BAD_TZ = "%{value} is not a valid timezone"
  BAD_OTA_HOUR = "must be a value from 0 to 23."
  ORDER_NUMBER_TAKEN = "has already been taken. " \
                       "If you purchased multiple FarmBots with the same " \
                       "order number, you may add -1, -2, -3, etc. to " \
                       "the end of the order number to register additional " \
                       "FarmBots after the first one."
  THROTTLE_ON = "Device is sending too many logs (%s). " \
                "Suspending log storage and display until %s."
  THROTTLE_OFF = "Cooldown period has ended. " \
                 "Resuming log storage."

  PLURAL_RESOURCES = %i(ai_feedbacks alerts curves farm_events farmware_envs farmware_installations
                        folders fragments images logs peripherals pin_bindings plant_templates
                        point_groups points regimens saved_gardens sensor_readings sensors sequences
                        telemetries token_issuances tools webcam_feeds wizard_step_results)

  PLURAL_RESOURCES.map { |resources| has_many resources, dependent: :destroy }

  SINGULAR_RESOURCES = {
    fbos_config: FbosConfig,
    firmware_config: FirmwareConfig,
    web_app_config: WebAppConfig,
  }

  SINGULAR_RESOURCES.map do |(name, klass)|
    has_one name, dependent: :destroy
    define_method(name) { super() || klass.create!(device: self) }
  end

  has_many :in_use_points
  has_many :in_use_tools
  has_many :users

  validates_presence_of :name
  validates :timezone, inclusion: {
                         in: TIMEZONES,
                         message: BAD_TZ,
                         allow_nil: true,
                       }
  validates :ota_hour,
    inclusion: { in: [*0..23], message: BAD_OTA_HOUR, allow_nil: true }
  validates :fb_order_number,
    uniqueness: { message: ORDER_NUMBER_TAKEN, allow_nil: true }
  before_validation :perform_gradual_upgrade

  def max_seq_count
    if max_sequence_count > 0
      max_sequence_count
    else
      DEFAULT_MAX_SEQUENCE_COUNT
    end
  end

  def max_seq_length
    if max_sequence_length > 0
      max_sequence_length
    else
      DEFAULT_MAX_SEQUENCE_LENGTH
    end
  end

  def max_log_age
    if max_log_age_in_days > 0
      max_log_age_in_days
    else
      DEFAULT_MAX_LOG_AGE_IN_DAYS
    end
  end

  # Give the user back the amount of logs they are allowed to view.
  def limited_log_list
    Log
      .order(created_at: :desc)
      .where(device_id: self.id)
      .where("created_at > ?", max_log_age.days.ago)
      .limit(max_log_count || DEFAULT_MAX_LOGS)
  end

  def excess_logs
    Log
      .where
      .not(id: limited_log_list.pluck(:id))
      .where(device_id: self.id)
  end

  def trim_excess_logs
    # Calls to `destroy_all` rather than `delete_all` can be
    # disastrous- this is a big table! RC
    excess_logs.delete_all
  end

  # Give the user back the amount of telemetry they are allowed to view.
  def limited_telemetry_list
    Telemetry
      .order(created_at: :desc)
      .where(device_id: self.id)
      .limit(DEFAULT_MAX_TELEMETRY)
  end

  def excess_telemetry
    Telemetry
      .where
      .not(id: limited_telemetry_list.pluck(:id))
      .where(device_id: self.id)
  end

  def trim_excess_telemetry
    excess_telemetry.delete_all
  end

  # Give the user back the amount of sensor readings they are allowed to view.
  def limited_sensor_readings_list
    sensor_readings
      .order(created_at: :desc)
      .limit(DEFAULT_MAX_SENSOR_READINGS)
  end

  def excess_sensor_readings
    sensor_readings
      .where
      .not(id: limited_sensor_readings_list.pluck(:id))
      .where(device_id: self.id)
  end

  def trim_excess_sensor_readings
    excess_sensor_readings.delete_all
  end

  def self.current
    RequestStore.store[:device]
  end

  def self.current=(dev)
    RequestStore.store[:device] = dev
  end
  # Sets Device.current to `self` and returns it to the previous value when
  #  finished running block. Usually this is unnecessary, but may be required in
  # background jobs. If you are not receiving auto_sync data on your client,
  # you probably need to use this method.
  def auto_sync_transaction
    Device.current = self
    yield
  ensure
    Device.current = nil
  end

  def tz_offset_hrs
    Time.now.in_time_zone(self.timezone || "UTC").utc_offset / 1.hour
  end

  def plants
    points.where(pointer_type: "Plant")
  end

  def tool_slots
    points.where(pointer_type: "ToolSlot")
  end

  def generic_pointers
    points.where(pointer_type: "GenericPointer")
  end

  # Sets the `throttled_until` and `throttled_at` fields if unpopulated or
  # the throttle time period increases. Notifies user of cooldown period.
  def maybe_throttle(violation)
    end_t = violation.ends_at
    # Some log validation errors will result in until_time being `nil`.
    if (throttled_until.nil? || (end_t > throttled_until))
      auto_sync_transaction do
        reload.update!(throttled_until: end_t, throttled_at: Time.now)
      end
      cooldown = end_t.in_time_zone(self.timezone || "UTC").strftime("%I:%M%p")
      info = [violation.explanation, cooldown]
      cooldown_notice(THROTTLE_ON % info, end_t, "warn")
    end
  end

  def maybe_unthrottle
    if throttled_until.present?
      old_time = throttled_until
      update!(throttled_until: nil, throttled_at: nil)
      cooldown_notice(THROTTLE_OFF, old_time, "info")
    end
  end

  # Send a realtime message to a logged in user.
  def tell(message, channels = [], type = "info")
    log = Log.new({ device: self,
                    message: message,
                    created_at: Time.now,
                    channels: channels,
                    major_version: 99,
                    minor_version: 99,
                    patch_version: 99,
                    meta: {},
                    type: type })
    json = LogSerializer.new(log).as_json.to_json

    Transport.current.amqp_send(json, self.id, "logs")
    return log
  end

  def cooldown_notice(message, throttle_time, type, now = Time.current)
    hours = ((throttle_time - now) / 1.hour).round
    channels = [(hours > 2) ? "email" : "toast"]
    tell(message, channels, type).save
  end

  # CONTEXT:
  #  * We tried to use Rails low level caching, but it hit marshalling issues.
  #  * We did a hack with Device.new(self.as_json) to get around it.
  #  * Mutations does not allow unsaved models
  #  * We converted the `model :device, class: Device` to:
  #     `duck :device, methods [:id, :is_device]`
  #
  # This method is not required, but adds a layer of safety.
  def is_device # SEE: Hack in Log::Create. TODO: Fix low level caching bug.
    true
  end

  def unsent_routine_emails
    logs
      .where(sent_at: nil)
      .where(Log::IS_EMAIL_ISH) # `email` and `fatal_email`
      .where
      .not(Log::IS_FATAL_EMAIL) # Filter out `fatal_email`s
      .order(created_at: :desc)
  end

  # Helper method to create an auth token.
  # Used by sys admins to debug problems without performing a password reset.
  def help_customer
    Rollbar.error("Someone is creating a debug user token", { device: self.id })
    t = SessionToken.as_json(users.first, "staff", fbos_version)
    jti = t[:token].unencoded[:jti]
    # Auto expire after 1 week.
    TokenIssuance.find_by!(jti: jti).update!(exp: (Time.now + 168.hours).to_i)
    return "localStorage['session'] = JSON.stringify(#{t.to_json});"
  end

  TOO_MANY_CONNECTIONS =
    "Your device is reconnecting to the server too often. " +
    "This may be a sign of local network issues. " +
    "Please review the documentation provided at " +
    "https://software.farm.bot/docs/connecting-farmbot-to-the-internet"
  def self.connection_warning(username)
    device_id = username.split("_").last.to_i || 0
    device = self.find_by(id: device_id)
    return unless device

    last_sent_at = device.mqtt_rate_limit_email_sent_at || 4.years.ago
    if last_sent_at < 1.day.ago
      device.update!(mqtt_rate_limit_email_sent_at: Time.now)
      device.tell(TOO_MANY_CONNECTIONS, ["fatal_email"])
    end
  end

  def self.get_utc_ota_hour(timezone, local_ota_hour)
    utc_offset = Time.now.in_time_zone(timezone).utc_offset / 60 / 60
    (local_ota_hour - utc_offset) % 24
  end

  # PROBLEM:  The device table has an `ota_hour` column. The
  #           column uses localtime rather than UTC. The new
  #           OTA system needs a UTC, though.
  #
  # SOLUTION: Perform a gradual update of legacy data.
  # TODO: Remove this method once FBOS < v12 hits EOL.
  def perform_gradual_upgrade
    if self[:ota_hour] && self[:timezone]
      valid = ActiveSupport::TimeZone[timezone].present?
      valid && self.ota_hour_utc = Device.get_utc_ota_hour(timezone, ota_hour)
    else
      self[:ota_hour] = nil
      self[:ota_hour_utc] = nil
    end
  end

  UPGRADE_RPC = {
    kind: "rpc_request",
    args: {
      label: "FROM_API",
      priority: 500,
    },
    body: [
      {
        kind: "check_updates",
        args: {
          package: "farmbot_os",
        },
      },
    ],
  }.to_json

  def send_upgrade_request
    Transport.current.amqp_send(UPGRADE_RPC, id, "from_clients")
  end

  def provide_feedback(message, slug = "Not provided")
    webhook_url = ENV["FEEDBACK_WEBHOOK_URL"]
    if webhook_url
      email = self.users.pluck(:email).join(" ")
      name = self.users.first.name
      since = self.users.first.created_at.to_s
      firmware_kind = fbos_config.firmware_hardware
      osm_url = "https://www.openstreetmap.org"
      location_url = "<#{osm_url}/?mlat=#{lat}&mlon=#{lng}&zoom=10|#{lat},#{lng}>"
      version = fbos_version.nil? ? "unknown" : "v#{fbos_version}"
      info = [
        "`Device ID`: #{id}",
        "`FBOS Version (from API)`: #{version}",
        "`Email`: #{email}",
        "`Name`: #{name}",
        "`User since`: #{since}",
        "`Timezone`: #{timezone}",
        "`Location`: #{(!lat.nil? && !lng.nil?) ? location_url : "unknown"}",
        "`Order Number`: #{fb_order_number}",
        "`Model`: #{firmware_kind}",
        "`Slug`: #{slug}",
        "`Message`: #{message}",
        "`Token:`",
      ].join("\n")
      payload = {
        "mrkdwn": true,
        "text": info,
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": info,
            }
          }
        ],
        "attachments": [
          {
            "blocks": [
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "```" + help_customer + "```",
                },
              },
            ],
          },
        ],
      }.to_json
      Faraday.post(webhook_url,
                   payload,
                   "Content-Type" => "application/json")
    end
  end
end
