require 'spec_helper'

describe Device do
  let(:device){ FactoryGirl.create(:device, users: [FactoryGirl.create(:user)])}
  let(:user)  { device.users.first }

  it 'is associated with a user' do
    expect(device.users.first).to be_kind_of(User)
    expect(user.device).to be_kind_of(Device)
  end

  it 'destroys dependant devices' do
    bot_id  = device.id
    user_id = user.id
    user.destroy
    user_results = User.where(id: user_id).first
    bot_results  = Device.where(id: bot_id).first
    expect(bot_results).to be_nil
    expect(user_results).to be_nil
  end
end
