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
    Transport.current.clear!
    hello      = "Hello!"
    log        = device.tell(hello)
    pending("BRB")
    json, info = Transport.current.calls[:publish].last
    json       = JSON.parse(json)
    expect(info[:routing_key]).to eq("bot.device_#{device.id}.logs")
    expect(log.message).to eq(hello)
    expect(json["message"]).to eq(hello)
  end
end
