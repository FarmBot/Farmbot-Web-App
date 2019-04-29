# User definable key/value pairs, usually used for Farmware authorship.
class FarmwareEnv < ApplicationRecord
  belongs_to :device
  serialize  :value
  validate   :primitives_only

  PRIMITIVES_ONLY = "`value` must be a string, number or boolean"

  def primitives_only
    errors.add(:value, PRIMITIVES_ONLY) unless is_primitive
  end

  def is_primitive
    [String, Integer, Float, TrueClass, FalseClass].include?(value.class)
  end
end
