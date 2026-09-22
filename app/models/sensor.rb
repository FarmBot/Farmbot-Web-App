class Sensor < ApplicationRecord
  TYPES = %w[soil_moisture tool_verification current none].freeze
  TYPES_ERR = "must be one of #{TYPES.join(", ")}. %{value} is not valid."

  self.inheritance_column = "none"
  belongs_to :device
  validates :device, presence: true
  validates :pin, presence: true
  validates :pin, uniqueness: { scope: :device }
  validates :pin, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :label, presence: true
  validates :type, inclusion: { in: TYPES, message: TYPES_ERR }
end
