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

  it 'trims the log list as needed' do
    device.update_attributes(max_log_count: 3)
    FactoryBot.create_list(:log, 5, device: device)
    expect(device.logs.count).to eq(5)
    device.trim_log_list!
    expect(device.logs.count).to eq(device.max_log_count)
  end
end
