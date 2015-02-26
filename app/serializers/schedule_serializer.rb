class ScheduleSerializer < ActiveModel::Serializer
  attributes :_id, :start_time, :end_time, :next_time, :repeat, :time_unit,
             :sequence_id, :sequence_name

  # TODO: This is almost certainly wrong. I shouldn't need to write this method.
  def sequence_id
    object.sequence._id.to_s
  end

  def sequence_name
    object.sequence.name
  end
end
