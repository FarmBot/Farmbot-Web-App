require 'spec_helper'

describe Api::DiagnosticDumpsController do
  let(:device) { FactoryBot.create(:device) }
  let(:user)   { FactoryBot.create(:user, device: device) }

  include Devise::Test::ControllerHelpers

  it 'lists all diagnostics' do
    sign_in user
    DiagnosticDump.destroy_all
    device_config = FactoryBot.create_list(:diagnostic_dump, 3, device: device)
    get :index
    expect(json.length).to eq(3)
    expect(json.pluck(:device_id).uniq).to eq([user.device.id])
  end

  it 'creates a dump' do
    sign_in user
    DiagnosticDump.destroy_all
    b4 = DiagnosticDump.count
    input = {
      fbos_version:      "123_fbos_version",
      fbos_commit:       "123_fbos_commit",
      firmware_commit:   "123_firmware_commit",
      network_interface: "123_network_interface",
      fbos_dmesg_dump:   "123_fbos_dmesg_dump",
      firmware_state:    "123_firmware_state",
    }
    post :create, body: input.to_json
    expect(response.status).to eq(200)
    expect(DiagnosticDump.count).to be > b4
    expect(DiagnosticDump.last.device).to eq(device)
    expect(json[:fbos_version]).to             eq("123_fbos_version")
    expect(json[:fbos_commit]).to              eq("123_fbos_commit")
    expect(json[:firmware_commit]).to          eq("123_firmware_commit")
    expect(json[:network_interface]).to        eq("123_network_interface")
    expect(json[:fbos_dmesg_dump]).to          eq("123_fbos_dmesg_dump")
    expect(json[:firmware_state]).to           eq("123_firmware_state")
    expect(json[:ticket_identifier].length).to be >= 4
  end

  it 'deletes' do
    sign_in user
    # DiagnosticDump.destroy_all
    device_config = FactoryBot.create(:diagnostic_dump, device: device)
    id            = device_config.id
    delete :destroy, params: { id: device_config.id }
    expect(response.status).to be(200)
    expect(DiagnosticDump.exists?(id)).to be false
  end
end
