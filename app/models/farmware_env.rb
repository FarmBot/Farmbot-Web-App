# User definable key/value pairs, usually used for Farmware authorship.
class FarmwareEnv < ApplicationRecord
  belongs_to :device
  serialize :value, coder: YAML
  validates :key, uniqueness: { scope: :device }
  validate :value_is_string

  private

  def value_is_string
    return if value_before_type_cast.is_a?(String)

    errors.add(:value, "must be a string")
  end
end
