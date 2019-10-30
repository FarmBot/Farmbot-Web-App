# Farmbot Device models all data related to an actual FarmBot in the real world.
class Device < ApplicationRecord
  DEFAULT_MAX_CONFIGS = 300
  DEFAULT_MAX_IMAGES = 100
  DEFAULT_MAX_LOGS = 1000

  TIMEZONES = TZInfo::Timezone.all_identifiers
  BAD_TZ = "%{value} is not a valid timezone"
  THROTTLE_ON = "Device is sending too many logs (%s). " \
                "Suspending log storage and display until %s."
  THROTTLE_OFF = "Cooldown period has ended. " \
                 "Resuming log storage."

  PLURAL_RESOURCES = %i(alerts farmware_envs farm_events farmware_installations
                        images logs peripherals pin_bindings plant_templates
                        points point_groups regimens saved_gardens
                        sensor_readings sensors sequences token_issuances tools
                        webcam_feeds diagnostic_dumps fragments)

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

  has_many :in_use_tools
  has_many :in_use_points
  has_many :users

  validates_presence_of :name
  validates :timezone, inclusion: {
                         in: TIMEZONES,
                         message: BAD_TZ,
                         allow_nil: true,
                       }

  # Give the user back the amount of logs they are allowed to view.
  def limited_log_list
    Log
      .order(created_at: :desc)
      .where(device_id: self.id)
      .limit(max_log_count || DEFAULT_MAX_LOGS)
  end

  def excess_logs
    Log
      .where
      .not(id: limited_log_list.pluck(:id))
      .where(device_id: self.id)
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
    prev = Device.current
    Device.current = self
    yield
    Device.current = prev
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
    return unless violation
    end_t = violation.ends_at
    # Some log validation errors will result in until_time being `nil`.
    if (throttled_until.nil? || end_t > throttled_until)
      reload.update!(throttled_until: end_t, throttled_at: Time.now)
      cooldown = end_t.in_time_zone(self.timezone || "UTC").strftime("%I:%M%p")
      info = [violation.explanation, cooldown]
      cooldown_notice(THROTTLE_ON % info, end_t, "warn")
    end
  end

  def maybe_unthrottle
    raise "NO ID???: #{self.as_json}" unless self.id

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

  def regimina
    regimens # :(
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
    token = SessionToken.as_json(users.first, "staff", fbos_version).to_json
    return "localStorage['session'] = JSON.stringify(#{token});"
  end

  TOO_MANY_CONNECTIONS =
    "Your device is " +
      "reconnecting to the server too often. Please " +
      "see https://developer.farm.bot/docs/connectivity-issues"
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
end
