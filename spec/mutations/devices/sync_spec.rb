require 'spec_helper'

describe Devices::Sync do
    let(:user) { FactoryBot.create(:user) }
    let(:device) { user.device }


  it 'is different this time!' do
    results = Devices::Sync.run!(device: device)
    expect(results.keys.sort).to eq([:devices,
                                     :farm_events,
                                     :farmware_envs,
                                     :farmware_installations,
                                     :fbos_configs,
                                     :firmware_configs,
                                     :now,
                                     :peripherals,
                                     :pin_bindings,
                                     :points,
                                     :regimens,
                                     :sensor_readings,
                                     :sensors,
                                     :sequences,
                                     :tools])
  end

  # it 'optimizes with SQL' do
  #   query         = "SELECT id, updated_at FROM ? WHERE device_id = ?"
  #   records_array = ActiveRecord::Base.connection.execute(sql)
  # end
end
