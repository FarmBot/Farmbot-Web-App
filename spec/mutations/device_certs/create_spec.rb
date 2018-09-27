require "spec_helper"

describe DeviceCerts::Create do
  let(:device) { FactoryBot.create(:device) }
  ser  = "123"
  tags = ["x"]

  it "creates a cert" do
    run_jobs_now do
      conn = double("Create a cert", :ca_file=    => nil,
                                     :cert_store  => nil,
                                     :cert_store= => nil,
                                     :use_ssl     => nil,
                                     :use_ssl=    => nil,
                                     :cert=       => nil,
                                     :key=        => nil)
      NervesHub.set_conn(conn)
      post_data = {identifier: 456}
      resp1     = double("get response", code: "200", body: {data:{}}.to_json)
      resp2     = double("put response", code: "201", body: {data: post_data }.to_json)
      resp3     = double("post response",code: "200", body: {data: {"cert" => "???"} }.to_json)
      url       = NervesHub.device_path(ser)
      put_args  = [NervesHub.device_path(ser),
                   {"tags": tags}.to_json,
                   NervesHub::HEADERS]
      hmm       = a_string_including("\"identifier\":456")
      post_args = ["/orgs/farmbot/devices/456/certificates/sign",
                   hmm,
                   {"Content-Type"=>"application/json"}]
      expect(NervesHub.conn).to(receive(:get).with(url).and_return(resp1))
      expect(NervesHub.conn).to(receive(:put).with(*put_args).and_return(resp2))
      expect(NervesHub.conn).to(receive(:post).with(*post_args).and_return(resp3))
      result = DeviceCerts::Create.run!(tags:          tags,
                                        device:        device,
                                        serial_number: ser)
      expect(result).to eq({})
    end
  end
end
