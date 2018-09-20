module DeviceCerts
  class Create < Mutations::Command
    required do
      model :device, class: Device
    end

    def execute
      {}
    end
  end
end
