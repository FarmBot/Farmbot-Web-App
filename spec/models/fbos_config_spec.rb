require "spec_helper"

describe FbosConfig do
    let(:device) { FactoryBot.create(:device) }
    let(:config) { FbosConfig.create!(device: device)             }

    def fake_conn(desc)
      double(desc, :ca_file=    => nil,
                   :cert_store  => nil,
                   :cert_store= => nil,
                   :use_ssl     => nil,
                   :use_ssl=    => nil,
                   :cert=       => nil,
                   :key=        => nil)
    end

    it "notifies us of broken production data" do
      # Remove this test by May 2019.
      config.device.update_attributes!(serial_number: nil)
      conn = fake_conn("Report broke data")
      NervesHub.set_conn(conn)
      problem = "Device #{device.id} missing serial"
      expect(NervesHub).to receive(:report_problem).with({ problem: problem })
      config.sync_nerves
    end

    it "triggers callbacks" do
      conn = fake_conn("Create a cert")
      NervesHub.set_conn(conn)
      url    = "/orgs/farmbot/devices/#{device.serial_number}"
      resp   = StubResp.new("200", { "data" => { "tags": [] } }.to_json)
      resp2  = StubResp.new("201", { "data" => { "tags": [] } }.to_json)
      params = [ url,
                 {"tags": ["channel:beta"]}.to_json,
                 {"Content-Type"=>"application/json"} ]
      expect(NervesHub.conn).to(receive(:get).with(url).and_return(resp))
      expect(NervesHub.conn).to(receive(:put).with(*params).and_return(resp2))

      run_jobs_now do
        config.update_attributes!(update_channel: "beta")
      end
    end

    it "has default firmware_hardware" do
      expect(FbosConfig.create!.firmware_hardware).to eq(nil)
    end
end
