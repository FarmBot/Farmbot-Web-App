# Support class for Fragment. Please see fragment.rb for documentation.
class Kind < ApplicationRecord
  EXPIRY = Rails.env.test? ? 1.second : 2.hours
  KEY    = "Kind_%s"
  has_many :nodes
  def self.cached_by_value(v)
    Rails
      .cache.fetch(KEY % v, expires_in: EXPIRY) { find_or_create_by(value: v) }
  end
end
