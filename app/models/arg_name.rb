# Support class for Fragment. Please see fragment.rb for documentation.
class ArgName < ApplicationRecord
  EXPIRY = 2.hours
  KEY    = "kind_%s"
  validates_uniqueness_of :value

  def self.cached_by_value(v)
    Rails
      .cache
      .fetch(KEY % v, expires_in: EXPIRY) { find_or_create_by(value: v) }
  end
end
