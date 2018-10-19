class PinBindingSerializer < ApplicationSerializer
  attributes :device_id, :sequence_id, :special_action, :pin_num, :binding_type

  def binding_type
    object.special_action ? "special" : "standard"
  end

  #  `sequence_id` and `special_action` are mutually exclusive.
  def sequence_id
    object.special_action ? nil : object.sequence_id
  end
end
