module DeviceCerts
  class Create < Mutations::Command
    required do
      model :device, class: Device
      string :serial_number
      array :tags, class: String
    end

    def execute
      data = {
        device_id: device.id,
        serial_number: serial_number,
        tags: tags
      }
      SendNervesHubInfoJob.perform_later(data)
      Hash.new
    end
  end
end
