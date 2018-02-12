module Peripherals
  class Destroy < Mutations::Command
    required { model :peripheral, class: Peripheral }
    IN_USE = "Can't delete peripheral because the following sequences "\
    "are still using it: %s"

    def validate
      not_in_use?
    end

    def execute
      peripheral.destroy!
    end

  private
    def sequences_using_it
      @sequences_using_it ||= EdgeNode
        .where(kind: "peripheral_id", value: peripheral.id)
        .pluck(:sequence_id)
    end

    def not_in_use?
      names = Sequence.where(id: sequences_using_it).pluck(:name).join(", ")
      add_error :peripheral, :in_use, (IN_USE % [names]) if names.present?
    end
  end
end
