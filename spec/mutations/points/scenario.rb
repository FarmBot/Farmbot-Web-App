require 'ostruct'

module Points
  # A scenario complicated (and common) enough to warrant its own wrapper class.
  # This will create a new Device, Tool, ToolSlot and Sequence which are
  # interdependent.
  # Good tool for testing dependency tracking.
  class Scenario < OpenStruct
    def  body
       [ { kind: "move_absolute",
           args: {
              location: { kind: "tool", args: { tool_id: self.tool.id } },
              offset:   { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
              speed:    100
           } } ]
    end

    def initialize(hash = nil)
      super(hash)
      self.device    = FactoryBot.create(:device)
      self.tool      = Tools::Create.run!(device: self.device,
                                          name: "Scenario Tool")
      self.tool_slot = Points::Create.run!(device:     self.device,
                                           name:       "Scenario Tool Slot",
                                           x:          0,
                                           y:          0,
                                           z:          0,
                                           pointer_type: "ToolSlot")
      self.sequence  = Sequences::Create.run!(device: self.device,
                                              body:   self.body,
                                              name:   "Scenario Sequence")
      Points::Update.run!(device:  self.device,
                          point:   self.tool_slot,
                          tool_id: self.tool.id)
      self.tool_slot.reload
    end
  end
end
