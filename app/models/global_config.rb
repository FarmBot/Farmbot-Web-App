# A key/value storage table for values that:
#    1. Are _global_ in nature (If not, use a "real" model/DB table)
#    2. Are not related to server provisioning (If not, use ENV vars)
#    3. Could possibly change at runtime (If not, use a hardcoded constant)
#    4. Are not security sensitive (If not, use ENV vars or secrets mgmt)
class GlobalConfig < ApplicationRecord
  serialize :value

  LONG_REVISION = ENV["BUILT_AT"] || ENV["HEROKU_SLUG_COMMIT"] || "NONE"

  DEFAULTS      = { NODE_ENV:       Rails.env || "development",
                    TOS_URL:        ENV.fetch("TOS_URL", ""),
                    PRIV_URL:       ENV.fetch("PRIV_URL", ""),
                    LONG_REVISION:  LONG_REVISION,
                    SHORT_REVISION: LONG_REVISION.first(8) }

  # Memoized version of every GlobalConfig, with key/values layed out in a hash.
  def self.dump
    @dump ||= DEFAULTS.merge({})
  end
end
