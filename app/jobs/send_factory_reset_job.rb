class SendFactoryResetJob < ApplicationJob
  queue_as :default

  def self.rpc_payload(device)
    { kind: "rpc_request",
      args: { label: "FROM_API" },
      body: [ { kind: "factory_reset", args: { package: "farmbot_os" } } ] }
  end

  def perform(device, transport = Transport)
    payl = SendFactoryResetJob.rpc_payload(device)
    transport.amqp_send(payl.to_json, device.id, "from_clients")
  end
end
