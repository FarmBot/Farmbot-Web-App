class StepSerializer < ActiveModel::Serializer
  attributes :id, :message_type, :command, :sequence_id, :position

  # This is almost certainly wrong. I shouldn't need to write this method.
  def sequence_id
    object.sequence_id
  end
end
