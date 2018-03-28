require 'spec_helper'

RSpec.describe SendFactoryResetJob, type: :job do
  let(:device) { FactoryBot.create(:device) }

  it 'sends a factory_reset RPC' do
    dbl = double("fake transport layer")
    payl = SendFactoryResetJob.rpc_payload(device)
    expect(dbl)
      .to receive(:amqp_send).with(payl.to_json, device.id, "from_clients")
    SendFactoryResetJob.new.perform(device, dbl)
  end
end
