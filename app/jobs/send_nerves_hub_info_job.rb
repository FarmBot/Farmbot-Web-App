class SendNervesHubInfoJob < ApplicationJob
  queue_as :default

  def perform(device_id:, serial_number:, tags:)
    device = Device.find(device_id)
    DeviceSerialNumber.transaction do
      device.update_attributes!(serial_number: serial_number)
      resp_data = NervesHub.create_or_update(serial_number, tags)
      certs     = NervesHub.sign_device(resp_data.fetch(:identifier))
      Transport.current.amqp_send(certs.to_json, device_id, "nerves_hub")
    end
  end
end
