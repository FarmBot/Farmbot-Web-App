class FarmEventSerializer < ActiveModel::Serializer
  attributes :id, :start_time, :end_time, :next_time, :repeat, :time_unit,
             :executable_id, :executable_type, :calendar
  try :url, :sequence

  def calendar
    # TODO: This is wrong!
    # Will not work if we add pagination.
    return [] if object.time_unit == FarmEvent::NEVER
    object.between start, finish
  end

  private

  def start
    t = options[:start]
    return t ? Time.parse(options[:start]) : Time.current.midnight - 1.day
  end

  def finish
    t = options[:finish]
    return t ? Time.parse(options[:finish]) : start + 1.day
  end
end