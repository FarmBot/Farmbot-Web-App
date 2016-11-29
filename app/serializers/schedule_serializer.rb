class ScheduleSerializer < ActiveModel::Serializer
  attributes :id, :start_time, :end_time, :next_time, :repeat, :time_unit,
             :sequence_id, :sequence_name, :calendar
  try :url, :sequence

  def sequence_name
    object.sequence.name
  end

  def calendar
    object.between start, finish
  end

  private

  def start
    if config[:start]
      Time.parse(config[:start])
    else
      Time.current.midnight - 1.day
    end
  end

  def finish
    if config[:finish]
      Time.parse(config[:finish])
    else
      start + 1.day
    end
  end
end
