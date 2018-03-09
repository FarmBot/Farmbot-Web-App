module PinBindings
  class Destroy < Mutations::Command
    required do
      model   :pin_binding, class: PinBinding
    end

    def execute
      pin_binding.destroy! && ""
    end
  end
end
