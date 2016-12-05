module Sync
  class Fetch  < Mutations::Command
    API_VERSION = ENV.fetch("HEROKU_SLUG_COMMIT", `git log --pretty=format:"%h" -1`) 
    COMPAT_NUM = 0

    required do
      model :device, class: Device
    end

    def validate
      maybe_initialize_a_tool_bay
    end

    def execute
      return { api_version:   API_VERSION[0,7],
               compat_num:    COMPAT_NUM,
               device:        device,
               users:         users,
               sequences:     sequences,
               regimens:      regimens,
               peripherals:   peripherals,
               regimen_items: regimen_items,
               plants:        plants,
               tool_bays:     tool_bays,
               tool_slots:    tool_slots,
               tools:         tools }.as_json
    end

  private

    def tools
      @tools = Tool.where(device: device)
    end

    def tool_slots
      @tool_slots ||= ToolSlot.where(tool_bay_id: tool_bays.pluck(:id))
    end

    def tool_bays
      @tool_bays ||= device.tool_bays
    end

    def plants
      @plants ||= device.plants
    end

    def regimen_items
      @regimen_items ||= RegimenItem.where(regimen_id: regimens.pluck(:id))
    end

    def peripherals
      @peripherals ||= device.peripherals
    end

    def regimens
      @regimens ||= device.regimens;
    end

    def sequences
      @sequences ||= device.sequences
    end

    def users
      @users = device.users
    end

    # The UI does not yet support creation of tool bays
    # This is a temporary stub
    # TODO: Remove this when UI level creation of tool bays happens.
    def maybe_initialize_a_tool_bay
      unless device.tool_bays.any?
        ToolBay.create(device: device, name: "Tool Bay 1")
      end
    end
  end
end