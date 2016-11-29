module Sync
  class Fetch  < Mutations::Command
    API_VERSION = ENV.fetch("HEROKU_SLUG_COMMIT", `git log --pretty=format:"%h" -1`) 
    COMPAT_NUM = 0

    required do
      model :device, class: Device
    end

    def execute
      return {
          api_version:   API_VERSION[0,7],
          compat_num:    COMPAT_NUM,
          device:        device,
          users:         users,
          sequences:     sequences,
          regimens:      regimens,
          peripherals:   peripherals,
          regimen_items: regimen_items,
          plants:        plants,
          tool_bays:     tool_bays,
          tool_slots:   tool_slots,
          tools:         tools
      }.as_json
    end

  private

    def tools
      # Eager load Tools,slots and bays for performance
      @tools = Tool
        .includes(tool_slot: :tool_bay)
        .where(tool_slot: {tool_bays: {device_id: Device.last.id}})
    end

    def tool_bays
      @tool_bays ||= tool_slots.map(&:tool_bay)
    end

    def tool_slots
      @tool_slots ||= tools.map(&:tool_slot)
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
  end
end