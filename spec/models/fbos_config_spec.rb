require 'spec_helper'

describe FbosConfig do
    let(:device) { FactoryBot.create(:device)         }
    let(:config) { FbosConfig.create!(device: device) }

    it 'triggers callbacks' do
      conn = double("Create a cert", :ca_file=    => nil,
                                     :cert_store  => nil,
                                     :cert_store= => nil,
                                     :use_ssl     => nil,
                                     :use_ssl=    => nil,
                                     :cert=       => nil,
                                     :key=        => nil)
      NervesHub.set_conn(conn)
      # url    = "/orgs/farmbot/devices/#{device.serial_number}"
      # resp   = StubResp.new("200", { "data" => { "tags": [] } }.to_json)
      # resp2  = StubResp.new("201", { "data" => { "tags": [] } }.to_json)
      # params = [ url,
      #            {"tags": ["channel:beta"]}.to_json,
      #            {"Content-Type"=>"application/json"} ]
      # expect(NervesHub.conn).to(receive(:get).with(url).and_return(resp))
      # expect(NervesHub.conn).to(receive(:put).with(*params).and_return(resp2))

      channel       = "beta"
      msg           = :push_changes_to_nerves_hub
      expect(config).to receive(msg).with(device.serial_number, channel)
      run_jobs_now do
        config.update_attributes!(update_channel: channel)
      end
    end
end
