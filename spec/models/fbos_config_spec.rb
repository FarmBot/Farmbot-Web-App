require "spec_helper"

describe FbosConfig do
  let(:device) { FactoryBot.create(:device) }
  let(:config) { FbosConfig.create!(device: device) }

  def fake_conn(desc)
    double(desc, :ca_file= => nil,
                 :cert_store => nil,
                 :cert_store= => nil,
                 :use_ssl => nil,
                 :use_ssl= => nil,
                 :cert= => nil,
                 :key= => nil)
  end

  it "has no default firmware_hardware" do
    expect(FbosConfig.create!.firmware_hardware).to eq(nil)
  end
end
