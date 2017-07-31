class FarmEventSerializer < ActiveModel::Serializer
  attributes :id, :start_time, :end_time, :repeat, :time_unit,
             :executable_id, :executable_type, :calendar

  def calendar
    case object.executable
      when Sequence then sequence_calendar
      when Regimen  then regimen_calendar
      else throw "Dont know how to calendarize #{exe.class}"
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
      .select { |x| x > Time.now } || []
  end

  def sequence_calendar
    FarmEvents::GenerateCalendar
      .run!(origin:      object.start_time,
            lower_limit: instance_options[:upper_limit] || Time.now,
            upper_limit: instance_options[:lower_limit] || object.end_time,
            repeat:      object.repeat,
            time_unit:   object.time_unit)
      .map(&:utc)
      .map(&:as_json)
  end
end
