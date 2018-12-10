# Support class for Fragment. Please see fragment.rb for documentation.
class Kind < ApplicationRecord
  EXPIRY = 2.hours
  KEY    = "kind_%s"

  def self.cached_by_value(v)
    Rails
      .cache.fetch(KEY % v, expires_in: EXPIRY) { find_or_create_by(value: v) }
  end
end
