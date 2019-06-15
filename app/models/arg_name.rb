# Support class for Fragment. Please see fragment.rb for documentation.
class ArgName < ApplicationRecord
  EXPIRY = Rails.env.test? ? 1.second : 2.hours
  KEY = "arg_names:%s"

  validates_uniqueness_of :value

  has_many :primitive_pairs, autosave: true
  has_many :standard_pairs, autosave: true

  def self.cached_by_value(v)
    key = KEY % v
    Rails.cache.fetch(key, expires_in: EXPIRY) { find_or_create_by(value: v) }
  end

  def self.cached_by_id(id)
    Rails.cache.fetch(KEY % id, expires_in: EXPIRY) { find(id) }
  end

  def broadcast?
    false
  end
end
