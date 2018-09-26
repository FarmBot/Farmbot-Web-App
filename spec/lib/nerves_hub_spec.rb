require "spec_helper"

describe NervesHub do
  class StubResp
    attr_accessor :code, :body

    def initialize(code, body)
      @code, @body = code, body
    end
  end

  let(:conn) do
    double("connection double", :ca_file=    => nil,
                                :cert_store  => nil,
                                :cert_store= => nil,
                                :use_ssl     => nil,
                                :use_ssl=    => nil,
                                :cert=       => nil,
                                :key=        => nil)
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
    resp = StubResp.new("200", { "data" => { hello: :world } }.to_json)
    ser  = "f1o2o3"
    url  = NervesHub.device_path(ser)

    allow(conn).to receive(:get).with(url).and_return(resp)

    NervesHub.set_conn(conn)

    expect(NervesHub.device(ser)).to eq(hello: "world")
  end

  it "returns `nil` when a 404 occurs" do
    resp = StubResp.new("404", { "data" => { i_dont: :think_so } }.to_json)
    ser  = "f1o2o3"
    url  = NervesHub.device_path(ser)

    allow(conn).to receive(:get).with(url).and_return(resp)

    NervesHub.set_conn(conn)

    expect(NervesHub.device(ser)).to eq(nil)
  end

  it "raises exception on unknown HTTP response codes" do
    resp = StubResp.new("500", "kablamo!".to_json)
    ser  = "f1o2o3"
    url  = NervesHub.device_path(ser)
    expect(conn).to receive(:get).with(url).and_return(resp)

    NervesHub.set_conn(conn)

    expect { NervesHub.device(ser) }.to raise_error(NervesHub::NervesHubHTTPError)
  end

  # it "updates a device" do
  #   resp = StubResp.new("404", { "data" => { i_dont: :think_so } }.to_json)
  #   ser  = "f1o2o3"
  #   allow(conn).to receive(:get).with(url).and_return(resp)

  #   url  = NervesHub.update(ser, ["foo"])


  #   NervesHub.set_conn(conn)
  # end
end
