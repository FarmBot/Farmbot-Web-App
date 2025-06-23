# A key/value storage table for values that:
#    1. Are _global_ in nature (If not, use a local config such as WebAppConfig)
#    2. Are not related to server provisioning (If not, use ENV vars)
#    3. Could possibly change at runtime (If not, use a hardcoded constant)
#    4. Are not security sensitive (If not, use ENV vars or secrets mgmt)
class GlobalConfig < ApplicationRecord
  validates_uniqueness_of :key
  validates_presence_of :key

  # Bootstrap these values, but NEVER clobber pre-existing ones:
  {
    "FBOS_END_OF_LIFE_VERSION" => "14.6.0",
    "MINIMUM_FBOS_VERSION" => "14.6.0",
    "TOS_URL" => ENV.fetch("TOS_URL", ""),
    "PRIV_URL" => ENV.fetch("PRIV_URL", ""),
  }.map do |(key, value)|
    x = self.find_by(key: key)
    self.create!(key: key, value: value) unless x
  end

  LONG_REVISION = ENV["BUILT_AT"] || ENV["HEROKU_BUILD_COMMIT"] || "NONE"
  # Bootstrap these values, and ALWAYS clobber pre-existing ones:
  {
    "NODE_ENV" => Rails.env || "development",
    "LONG_REVISION" => LONG_REVISION,
    "SHORT_REVISION" => LONG_REVISION.first(8),
    # We only need this for the demo tour.
    # Remove it if the demo tour does not require it.
    "MQTT_WS" => SessionToken::MQTT_WS,
  }.map do |(key, value)|
    self.find_or_create_by(key: key).update(key: key, value: value)
  end

  # Memoized version of every GlobalConfig, with key/values laid out in a hash.
  # Database values preempt values set in ::DEFAULTS
  def self.dump
    @dump ||= reload_
  end

  def self.reload_
    @dump = {}
    GlobalConfig.all.map { |x| @dump[x.key] = x.value }
    @dump
  end
end
