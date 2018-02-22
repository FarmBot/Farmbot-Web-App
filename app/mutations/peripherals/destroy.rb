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
    def not_in_use?
      # TODO: Perform SQL UNION query here for teh performance
      pins  = EdgeNode.where(kind: "pin_id", value: peripheral.id).pluck(:primary_node_id)
      types = EdgeNode.where(kind: "pin_type", value: "Peripheral").pluck(:primary_node_id)
      all   = PrimaryNode.includes(:sequence).where(id: pins && types).pluck(:sequence_id)
      names = Sequence.where(id: all).pluck(:name)
      add_error :peripheral, :in_use, (IN_USE % names) if names.present?
    end
  end
end
