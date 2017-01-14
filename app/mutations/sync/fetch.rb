module Sync
  class Fetch  < Mutations::Command
    API_VERSION = ENV.fetch("HEROKU_SLUG_COMMIT", `git log --pretty=format:"%h" -1`)
    COMPAT_NUM = 1

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
               tools:         tools,
               logs:          logs,
               images:        images }.as_json
    end

  private

    def images
      # TODO: I wanted to just write:
      # @images ||= Images::Fetch.run!(device: device)
      # But ActiveModelSerializer is not serializing the models. Instead, it is
      # just converting all of the models [mostly irrelevant] attributes to
      # json directly. This method is also very slow right now. :shipit:
      @images ||= Images::Fetch
        .run!(device: device)
        .map { |x| ImageSerializer.new(x) }
        .map { |x| x.as_json[:image] }
    end

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
      @users ||= device.users
    end

    def logs
      @logs ||= device.logs.last(Log::PAGE_SIZE)
    end

    # PROBLEM: The UI does not offer a means of creating tool bays. You must
    # have a ToolBay to create a ToolSlot or Tool. Temporary fix: Create a
    # ToolBay in the background if the user does not have one.
    # TODO: Remove this when UI level creation of tool bays happens.
    def maybe_initialize_a_tool_bay
      unless device.tool_bays.any?
        ToolBay.create(device: device, name: "Tool Bay 1")
      end
    end
  end
end