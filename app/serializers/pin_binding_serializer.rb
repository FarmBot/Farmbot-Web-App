class PinBindingSerializer < ActiveModel::Serializer
  attributes :id, :created_at, :updated_at, :device_id, :sequence_id,
             :special_action, :pin_num

  #  `sequence_id` and `special_action` are mutually exclusive.
  def sequence_id
    object.special_action ? nil : object.sequence_id
  end
end
