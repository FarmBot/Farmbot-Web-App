class FarmEventSerializer < ActiveModel::Serializer
  attributes :id, :start_time, :end_time, :next_time, :repeat, :time_unit,
             :executable_id, :executable_type, :calendar

  def calendar
    FarmEvents::GenerateCalendar
      .run!(start_time: object.start_time,
            end_time:   object.end_time,
            repeat:     object.repeat,
            time_unit:  object.time_unit)
      .map(&:utc)
      .map(&:as_json)
  end
end
