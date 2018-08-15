require "spec_helper"

describe FarmwareInstallation do
  FAKE_URL = "http://www.sphere.bc.ca/test/circular-man2.html"

  it 'Enforces uniqueness of URL' do
    FarmwareInstallation.destroy_all
    device = FactoryBot.create(:device)
    first  = FarmwareInstallation.create(device: device, url: FAKE_URL)
    second = FarmwareInstallation.create(device: device, url: FAKE_URL)
    expect(first.valid?).to be true
    expect(second.valid?).to be false
    expect(second.errors[:url]).to include("has already been taken")
  end

  it 'disallows empty URLs' do
    x = FarmwareInstallation.create(url: "")
    expect(x.errors[:url]).to include("is an invalid URL")
  end
end
