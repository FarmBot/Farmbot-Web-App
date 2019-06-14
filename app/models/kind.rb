# Support class for Fragment. Please see fragment.rb for documentation.
class Kind < ApplicationRecord
  EXPIRY = Rails.env.test? ? 1.second : 2.hours
  KEY = "kinds:%s"
  has_many :nodes

  def self.cached_by_value(v)
    Rails
      .cache.fetch(KEY % v, expires_in: EXPIRY) { find_or_create_by(value: v) }
  end

  def self.cached_by_id(id)
    Rails.cache.fetch(KEY % id, expires_in: EXPIRY) { find(id) }
  end

  def self.nothing
    Kind.cached_by_value("nothing")
  end

  def self.entry_point
    Kind.cached_by_value("internal_entry_point")
  end

  def broadcast?
    false
  end
end
