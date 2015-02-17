# Responsible for timing and execution of sequences.
class Schedule
  include Mongoid::Document
  field :start_date, type: Date
  field :end_date, type: Date
  field :every, type: Integer
  UNITS_OF_TIME = %w(minutes hours days weeks months years)
  field :unit_of_time
  validates_inclusion_of :unit_of_time, in: UNITS_OF_TIME
end
