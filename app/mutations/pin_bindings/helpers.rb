module PinBindings
  module Helpers
    BAD_SEQ_ID       = "Sequence ID is not valid"
    MUTUAL_EXCLUSION = "Pin Bindings require exactly one sequence or special " \
                       "action. Please pick one."

    def validate_pin_num
      if pin_num && PinBinding::OFF_LIMITS.include?(pin_num)
        add_error :pin_num, :pin_num, PinBinding::BAD_PIN_NUM
      end
    end

    def false_xor_sequence_id_special_actn
      add_error :sequence_id, :sequence_id, MUTUAL_EXCLUSION
    end

    def exactly_one_choice
      false_xor_sequence_id_special_actn if !(sequence_id || special_action)
    end

    def not_both_actions
      false_xor_sequence_id_special_actn if sequence_id && special_action
    end

    def validate_sequence_id
      if sequence_id && !device.sequences.exists?(sequence_id)
        add_error :sequence_id, :sequence_id, BAD_SEQ_ID
      end
    end
  end
end
