# A key/value storage table for values that:
#    1. Are _global_ in nature (If not, use a local config such as WebAppConfig)
#    2. Are not related to server provisioning (If not, use ENV vars)
#    3. Could possibly change at runtime (If not, use a hardcoded constant)
#    4. Are not security sensitive (If not, use ENV vars or secrets mgmt)
class GlobalConfig < ApplicationRecord
  validates_uniqueness_of :key
  validates_presence_of   :key

  LONG_REVISION = ENV["BUILT_AT"] || ENV["HEROKU_SLUG_COMMIT"] || "NONE"
  DEFAULTS      = { "NODE_ENV"                 => Rails.env || "development",
                    "TOS_URL"                  => ENV.fetch("TOS_URL", ""),
                    "PRIV_URL"                 => ENV.fetch("PRIV_URL", ""),
                    "LONG_REVISION"            => LONG_REVISION,
                    "SHORT_REVISION"           => LONG_REVISION.first(8),
                    "FBOS_END_OF_LIFE_VERSION" => "0.0.0",
                    "MINIMUM_FBOS_VERSION"     => "6.0.0" }

  # Memoized version of every GlobalConfig, with key/values layed out in a hash.
  # Database values prempt values set in ::DEFAULTS
  def self.dump
    @dump ||= reload_
  end

  def self.reload_
    @dump = DEFAULTS.merge({})
    GlobalConfig.all.map{ |x| @dump[x.key] = x.value }
    @dump
  end
end
