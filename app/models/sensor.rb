class Sensor < ApplicationRecord
  belongs_to :device
  validates  :device, presence: true
  validates  :pin,    presence: true
  validates  :pin,    uniqueness: { scope: :device }
  validates  :pin,    numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates  :label,  presence: true
end
