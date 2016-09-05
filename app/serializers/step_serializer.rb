class StepSerializer < ActiveModel::Serializer
  attributes :id, :message_type, :command, :sequence_id, :position
end
