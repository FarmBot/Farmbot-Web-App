module Devices
  class Update < Mutations::Command
    required do
      model :device, class: Device
    end

    optional do
      string  :name
      string  :timezone#, in: Device::TIMEZONES
      time    :last_saw_mq
      integer :mounted_tool_id, nils: true
    end

    def execute
      p = inputs.except(:device).merge(mounted_tool_data)
      device.update_attributes!(p)
      device
    end

    def better_tool_id
      ((mounted_tool_id || 0) > 0) ? mounted_tool_id : nil
    end

    def mounted_tool_data
      mounted_tool_id_present? ?
        {mounted_tool_id: better_tool_id} : {}
    end
  end
end
