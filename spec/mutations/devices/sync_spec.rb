require 'spec_helper'

describe Devices::Sync do
    let(:user) { FactoryBot.create(:user) }
    let(:device) { user.device }


  it 'is different this time!' do
    results = Devices::Sync.run!(device: device)
    expect(results.keys.sort).to eq([ :device,
                                      :diagnostic_dumps,
                                      :farm_events,
                                      :farmware_envs,
                                      :farmware_installations,
                                      :fbos_config,
                                      :firmware_config,
                                      :now,
                                      :peripherals,
                                      :pin_bindings,
                                      :points,
                                      :regimens,
                                      :sensor_readings,
                                      :sensors,
                                      :sequences,
                                      :tools ])
  end
end
