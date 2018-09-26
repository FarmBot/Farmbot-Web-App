require "spec_helper"

describe NervesHub do
  class StubResp
    attr_accessor :code, :body

    def initialize(code, body)
      @code, @body = code, body
    end
  end

  def stub_connection
    double(SecureRandom.hex.first(6), :ca_file=    => nil,
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
    conn = stub_connection
    resp = StubResp.new("200", { "data" => { hello: :world } }.to_json)
    ser  = "f1o2o3"
    url  = NervesHub.device_path(ser)

    allow(conn).to receive(:get).with(url).and_return(resp)

    NervesHub.set_conn(conn)

    expect(NervesHub.device(ser)).to eq(hello: "world")
  end

  it "returns `nil` when a 404 occurs" do
    conn = stub_connection
    resp = StubResp.new("404", { "data" => { i_dont: :think_so } }.to_json)
    ser  = "f1o2o3"
    url  = NervesHub.device_path(ser)

    allow(conn).to receive(:get).with(url).and_return(resp)

    NervesHub.set_conn(conn)

    expect(NervesHub.device(ser)).to eq(nil)
  end

  it "raises exception on unknown HTTP response codes" do
    conn = stub_connection
    resp = StubResp.new("500", "kablamo!".to_json)
    ser  = "f1o2o3"
    url  = NervesHub.device_path(ser)
    expect(conn).to receive(:get).with(url).and_return(resp)

    NervesHub.set_conn(conn)

    expect { NervesHub.device(ser) }.to raise_error(NervesHub::NervesHubHTTPError)
  end

  it "handles failed updates to a device" do
    conn          = stub_connection
    resp          = StubResp.new("500", { "data" => { } }.to_json)
    ser           = "f1o2o3"
    expected_args = [NervesHub.device_path(ser),
                     {"tags":["foo"]}.to_json,
                     NervesHub::HEADERS]

    NervesHub.set_conn(conn)
    allow(conn).to receive(:put).with(*expected_args).and_return(resp)

    expect { NervesHub.update(ser, ["foo"]) }
      .to raise_error(NervesHub::NervesHubHTTPError)
  end

  it "updates the device via REST" do
    conn          = stub_connection
    resp          = StubResp.new("201", { "data" => {x: "y"} }.to_json)
    ser           = "f1o2o3"
    expected_args = [NervesHub.device_path(ser),
                     {"tags":["foo"]}.to_json,
                     NervesHub::HEADERS]

    NervesHub.set_conn(conn)
    allow(conn).to receive(:put).with(*expected_args).and_return(resp)
    results = NervesHub.update(ser, ["foo"])
    expect(results).to eq(x: "y")
  end

  it "generates a new, random key" do
    key1 = NervesHub.generate_device_key
    expect(key1).to be_kind_of(OpenSSL::PKey::EC)
    key2 = NervesHub.generate_device_key
    expect(key1.to_pem).not_to eq(key2.to_pem)
  end

end
