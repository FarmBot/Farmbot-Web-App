# Support class for Fragment. Please see fragment.rb for documentation.
class Primitive < ApplicationRecord
  PRIMITIVES     = [ FalseClass, TrueClass, Float, Integer, String, Symbol ]
  LENGTH_LIMIT   = 400
  PRIMITIVE_ONLY = "Expected primitive class. Got: %s"
  BAD_LENGTH     = "Primitives must be shorter than 400 chars in length"

  belongs_to :fragment
  has_many   :primitive_pairs
  serialize  :value
  validate   :primitives_only, :limit_length

  def primitives_only
    unless PRIMITIVES.include?(value.class)
      # errors.add(:value, PRIMITIVE_ONLY)
      raise PRIMITIVE_ONLY % value.class
    end
  end

  def limit_length
    errors.add(:value, BAD_LENGTH) if length > LENGTH_LIMIT
  end

  def length
    value.to_s.length
  end
end
