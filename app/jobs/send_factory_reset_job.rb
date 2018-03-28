class SendFactoryResetJob < ApplicationJob
  queue_as :default

  def perform(device)
    payload = {
      kind: "rpc_request",
      args: { label: "FROM_API.#{SecureRandom.hex}" },
      body: [ { kind: "factory_reset", args: { package: "farmbot_os" } } ]
    }
    Transport.amqp_send(payload.to_json, device.id, "from_clients")
  end
end
