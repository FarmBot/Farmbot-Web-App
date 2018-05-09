# Store metrics about readings for later analysis and graphing by 3rd party APIs
class SensorReading < ApplicationRecord
  belongs_to :device
end
