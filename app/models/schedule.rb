# Responsible for timing and execution of sequences.
class Schedule
  include Mongoid::Document
  UNITS_OF_TIME = %w(minutely hourly daily weekly monthly yearly)

  belongs_to :sequence
  validates_presence_of :sequence_id
  belongs_to :device
  validates_presence_of :device_id

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

  def between(start, finish)
    # Just for reference for later. Probably should just delegate.
    schedule.occurrences_between(start, finish)
  end
end
