require 'spec_helper'

describe Devices::Update do
    let(:user) { FactoryGirl.create(:user) }
    let(:device) { user.device }


  it 'updates an existing device' do
    previous_name = device.name
    previous_webcam_url = device.webcam_url
    p = { webcam_url: "http://myfeed.com/feed.jpeg", name:  Haikunator.haikunate(1000) }
    Devices::Update.run!({device: device}, p)
    device.reload
    expect(device.name).to eq(p[:name])
    expect(device.webcam_url).to eq(p[:webcam_url])
  end
end