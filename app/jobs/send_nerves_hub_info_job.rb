class SendNervesHubInfoJob < ApplicationJob
  queue_as :default

  def perform(device_id:, serial_number:, tags:)
    resp_data = NervesHub.create_or_update(serial_number, tags)
    certs = NervesHub.sign_device(resp_data[:identifier])
    Transport.current.amqp_send(certs.to_json, device_id, "nerves_hub")
  end
end
