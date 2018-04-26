require "spec_helper"

describe Device do
  let(:device){ FactoryBot.create(:device, users: [FactoryBot.create(:user)])}
  let(:user)  { device.users.first }

  it "is associated with a user" do
    expect(device.users.first).to be_kind_of(User)
    expect(user.device).to be_kind_of(Device)
  end

  it "destroys dependent devices" do
    bot_id  = device.id
    user_id = user.id
    user.destroy
    user_results = User.where(id: user_id).first
    bot_results  = Device.where(id: bot_id).first
    expect(bot_results).to be_nil
    expect(user_results).to be_nil
  end

  it "calculates TZ offset in hours" do
    device.timezone = nil
    expect(device.tz_offset_hrs).to be 0
    device.timezone = "America/Chicago"
    expect([-5, -6, -7]).to include device.tz_offset_hrs # Remember DST!
  end

  it "sends specific users toast messages" do
    hello = "Hello!"
    log   = device.tell(hello)
    json, id, chan = Transport.current.calls[:amqp_send].last
    json  = JSON.parse(json)

    expect(id).to eq(device.id)
    expect(log.message).to eq(hello)
    expect(chan).to eq("logs")
  end
end
