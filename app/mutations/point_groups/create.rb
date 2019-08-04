module PointGroups
  class Create < Mutations::Command
    required do
      model :device, class: Device
    end

    def execute
      raise "Not yet implemented"
    end
  end
end
