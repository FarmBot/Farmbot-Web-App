require "spec_helper"

describe NervesHub do
  class StubConn
    attr_accessor :ca_file, :cert_store, :use_ssl, :cert, :key
  end

  class StubResp
    attr_accessor :code, :body

    def initialize(code, body)
      @code, @body = code, body
    end
  end

  it "generates HTTP failure messages" do
    status = "800"
    msg    = "failed to reticulate splines."
    expect { NervesHub.bad_http(status, msg) }
      .to raise_error(NervesHub::NervesHubHTTPError)
  end

  it "generates URL paths" do
    expect(NervesHub.devices_path).to          eq "/orgs/farmbot/devices"
    expect(NervesHub.device_path("foo")).to    eq "/orgs/farmbot/devices/foo"
    expect(NervesHub.device_sign_path(123)).to eq "/orgs/farmbot/devices/123/certificates/sign"
  end

  it "gets a device via .device" do
    conn = StubConn.new
    resp = StubResp.new("200", { "data" => { hello: :world } }.to_json)
    ser  = "f1o2o3"
    url  = NervesHub.device_path(ser)

    allow(conn).to receive(:get).with(url).and_return(resp)

    NervesHub.set_conn(conn)

    expect(NervesHub.device(ser)).to eq(hello: "world")
  end
end
