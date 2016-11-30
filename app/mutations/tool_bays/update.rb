module ToolBays
  class Update < Mutations::Command
    required do
      model :device, class: Device
      model :tool_bay, class: ToolBay
    end

    optional do
      string :name
    end

    def execute
      tool_bay.update_attributes!(update_params) && tool_bay
    end

private

    def update_params
      inputs.except(:device, :tool_bay)
    end
  end
end