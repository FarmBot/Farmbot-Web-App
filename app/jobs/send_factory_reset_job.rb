class SendFactoryResetJob < ApplicationJob
  queue_as :default

  def perform(device)

    CeleryBuilder
      .build do |cs|
        cs.rpc_request { cs.factory_reset(package: "farmbot_os") }
      end
      .dump
    Transport.amqp_send()
    # Do something later
  end
end
