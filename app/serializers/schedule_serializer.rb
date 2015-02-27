class ScheduleSerializer < ActiveModel::Serializer
  attributes :_id, :start_time, :end_time, :next_time, :repeat, :time_unit,
             :sequence_id, :sequence_name, :calendar
  try :url, :sequence
  # TODO: This is almost certainly wrong. I shouldn't need to write this method.
  def sequence_id
    object.sequence._id.to_s
  end

  def sequence_name
    object.sequence.name
  end

  def calendar
    start  = serialization_options[:start]
    finish = serialization_options[:finish]
    if start && finish
      object.between start, finish
    else
      []
    end
  end
end
