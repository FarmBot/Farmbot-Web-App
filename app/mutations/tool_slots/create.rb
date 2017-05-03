module ToolSlots
  class Create < ToolSlots::Base
    required do
      model   :device, class: Device
    end

    optional do
      integer :tool_id
      string  :name
      integer :x
      integer :y
      integer :z
    end

    def validate
      validate_tool
    end

  def execute
    Point
      .create!(inputs.slice(:x,:y,:z).merge(pointer: pointer))
      .pointer
  end

  def pointer
    ToolSlot.new(inputs.slice(:device, :name, :tool_id))
  end
end
