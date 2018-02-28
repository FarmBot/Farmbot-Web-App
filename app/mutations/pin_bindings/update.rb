module PinBindings
  class Update < Mutations::Command
    required do
      model   :device, class: Device
    end

    def execute
      raise "TODO"
    end
  end
end
