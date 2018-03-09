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
      Sequence.if_still_using(peripheral) do |sequences|
        names = sequences.pluck(:name)
        add_error :peripheral, :in_use, (IN_USE % names) if names.present?
      end
    end
  end
end
