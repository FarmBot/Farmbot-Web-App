# Responsible for timing and execution of sequences.
class Schedule
  include Mongoid::Document
  UNITS_OF_TIME = %w(minutely hourly daily weekly monthly yearly)

  belongs_to :sequence
  belongs_to :user

  field :start_time, type: Time
  field :end_time, type: Time
  field :next_time, type: Time
  validates_presence_of :next_time
  field :repeat, type: Integer
  field :time_unit
  validates_inclusion_of :time_unit, in: UNITS_OF_TIME

  def schedule
    @schedule ||= IceCube::Schedule.new(start_time, end_time: end_time) do |sch|
      sch.add_recurrence_rule IceCube::Rule.send(time_unit.to_sym, repeat)
    end
  end

  def calculate_next_occurence
    schedule.next_occurrence
  end
end
