class SendNervesHubInfoJob < ApplicationJob
  queue_as :default

  def perform(device_id:, serial_number:, tags:)
    device = Device.find(device_id)
    resp_data = NervesHub.maybe_create_or_update(serial_number, tags)
    return unless resp_data # Probably has bad tags if nil
    certs = NervesHub.sign_device(resp_data.fetch(:identifier))
    Transport.current.amqp_send(certs.to_json, device_id, "nerves_hub")
  rescue => error
    NervesHub.report_problem({ error: error,
                               device_id: device_id,
                               serial_number: serial_number,
                               tags: tags })
    raise error
  end
end
