module Sync
  class Fetch  < Mutations::Command
    API_VERSION = ENV.fetch("HEROKU_SLUG_COMMIT", `git log --pretty=format:"%h" -1`)
    COMPAT_NUM  = 1

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
               points:        points,
               tool_bays:     tool_bays,
               tool_slots:    tool_slots,
               tools:         tools,
               logs:          logs,
               images:        images,
               farm_events:   farm_events }.as_json
    end

  private

    def farm_events
      @farm_events ||= ActiveModel::ArraySerializer.new(FarmEvent.where(device: device),
                                                        each_serializer: FarmEventSerializer).tap { $PROFILE.("1") }
    end

    def images
      @images ||= ActiveModel::ArraySerializer
                    .new(Images::Fetch.run!(device: device),
                         each_serializer: ImageSerializer).tap { $PROFILE.("2") }
    end

    def tools
      @tools = ActiveModel::ArraySerializer.new(Tool.where(device: device),
                                                each_serializer: ToolSerializer).tap { $PROFILE.("3") }
    end

    def tool_slots
      @tool_slots ||= ActiveModel::ArraySerializer
                        .new(ToolSlot.where(tool_bay_id: tool_bays.pluck(:id)),
                             each_serializer: ToolSlotSerializer).tap { $PROFILE.("4") }
    end

    def tool_bays
      @tool_bays ||= device.tool_bays.tap { $PROFILE.("5") }
    end

    def plants
      @plants ||= device.plants.tap { $PROFILE.("6") }
    end

    def regimen_items
      @regimen_items ||= RegimenItem.where(regimen_id: regimens.pluck(:id)).tap { $PROFILE.("7") }
    end

    def peripherals
      @peripherals ||= device.peripherals.tap { $PROFILE.("8") }
    end

    def regimens
      @regimens ||= device.regimens.tap { $PROFILE.("9") };
    end

    def sequences
      @sequences ||= device.sequences.tap { $PROFILE.("10") }
    end

    def users
      @users ||= device.users.tap { $PROFILE.("11") }
    end

    def logs
      @logs ||= device.limited_log_list.tap { $PROFILE.("12") }
    end

    def points
      @points = ActiveModel::ArraySerializer.new(Point.where(device: device),
                                                each_serializer: PointSerializer).tap { $PROFILE.("13") }
    end

    # PROBLEM: The UI does not offer a means of creating tool bays. You must
    # have a ToolBay to create a ToolSlot or Tool. Temporary fix: Create a
    # ToolBay in the background if the user does not have one.
    # TODO: Remove this when UI level creation of tool bays happens.
    def maybe_initialize_a_tool_bay
      unless device.tool_bays.any?
        ToolBay.create(device: device, name: "Tool Bay 1").tap { $PROFILE.("14") }
      end
    end
  end
end