class StepParam < ActiveRecord::Base
  belongs_to :step
  # For reference when we add serializers / deserializers

  TYPES = { x:               Float,
            y:               Float,
            z:               Float,
            speed:           Float,
            pin:             Fixnum,
            mode:            Fixnum,
            sub_sequence_id: Fixnum,
            value:           String,
            variable:        String,
            operator:        String }
end
