class ToolBay < ApplicationRecord
  belongs_to :device
  has_many :tool_slots, dependent: :destroy
  # It is so common to do a SQL query for ToolBays with the tool_slot and
  # tools Joined in that I made a query object ot represent it.
  class DeviceQuery
    attr_reader :device, :query
    def initialize(device)
      @device = device
      @query  = ToolBay
                  .includes(tool_slots: :tools)
                  .where(device_id: device.id)
    end

    def find(name, id)
      result = send(name).find { |s| s.id == id.to_i }
      raise ActiveRecord::RecordNotFound,
        "Could not find #{name} with id #{id}" if !result
      result
    end

    def tool_bays
      query
    end

    def tool_slots
      query.map(&:tool_slots).flatten.uniq
    end

    def tools
      tool_slots.map(&:tools).flatten.uniq
    end
  end
end
