module Tools
  class Create  < Mutations::Command
    required do
      string :name
      model :device, class: Device
    end

    optional do
      integer :tool_slot_id 
    end

    def validate
      puts "TODO: Validate user authorizations"
    end

    def execute
      Tool.create!(inputs)
    end

  private

    def query
      @query ||= ToolBay::DeviceQuery.new(device)
    end
  end
end
