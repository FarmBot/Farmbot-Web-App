# Support class for Fragment. Please see fragment.rb for documentation.
class Primitive < ApplicationRecord
  PRIMITIVES     = [ FalseClass, TrueClass, Float, Integer, String, Symbol ]
  LENGTH_LIMIT   = 300
  PRIMITIVE_ONLY = "Expected primitive class. Got: %s"
  BAD_LENGTH     = "Primitives must be shorter than"\
                   " #{LENGTH_LIMIT} chars in length"

  belongs_to :fragment
  has_many   :primitive_pairs
  serialize  :value
  validate   :primitives_only, :limit_length

  def primitives_only
    errors.add(:value, PRIMITIVE_ONLY) unless PRIMITIVES.include?(value.class)
  end

  def limit_length
    errors.add(:value, BAD_LENGTH) if length > LENGTH_LIMIT
  end

  def length
    value.to_s.length
  end
end
