class ScheduleSerializer < ActiveModel::Serializer
  attributes :id, :start_time, :end_time, :next_time, :repeat, :time_unit,
             :sequence_id, :sequence_name, :calendar
  try :url, :sequence
  # TODO: This is almost certainly wrong. I shouldn't need to write this method.
  def sequence_id
    object.sequence.id
  end

  def sequence_name
    object.sequence.name
  end

  def calendar
    object.between start, finish
  end

  private

  def start
    if options[:start]
      Time.parse(options[:start])
    else
      Time.current.midnight - 1.day
    end
  end

  def finish
    if options[:finish]
      Time.parse(options[:finish])
    else
      start + 1.day
    end
  end
end
