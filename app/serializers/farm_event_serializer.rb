class FarmEventSerializer < ActiveModel::Serializer
  attributes :id, :start_time, :end_time, :repeat, :time_unit,
             :executable_id, :executable_type, :calendar

  def calendar
    case object.executable
      when Sequence then sequence_calendar
      # We don't make calendars for Regimens- compute it yourself using
      # my_farm_event.executable.regimen_items - RC July 2017
      else []
    end
  end

  private

  def sequence_calendar
    FarmEvents::GenerateCalendar
      .run!(start_time: object.start_time,
            end_time:   object.end_time,
            repeat:     object.repeat,
            time_unit:  object.time_unit)
      .map(&:utc)
      .map(&:as_json)
  end
end
