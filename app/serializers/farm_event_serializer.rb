class FarmEventSerializer < ActiveModel::Serializer
  class BadExe < StandardError; end
  attributes :id, :start_time, :end_time, :repeat, :time_unit,
             :executable_id, :executable_type, :calendar

  def calendar
    case object.executable
      when Sequence then sequence_calendar
      when Regimen  then regimen_calendar
      else
        msg = "Dont know how to calendarize #{object.executable.class}"
        throw BadExe.new(msg)
    end
  end

  private

  def regimen_calendar
    object
      .executable
      .regimen_items
      .pluck(:time_offset)
      .map { |x| x / 1000 }
      .map { |x| object.start_time.midnight + x }
      .map(&:utc)
      .select { |x| !x.past? }
      .map(&:as_json) || []
  end

  def sequence_calendar
    FarmEvents::GenerateCalendar
      .run!(origin:      object.start_time,
            lower_limit: Time.now,
            upper_limit: object.end_time,
            repeat:      object.repeat,
            time_unit:   object.time_unit)
      .map(&:utc)
      .map(&:as_json)
  end
end
