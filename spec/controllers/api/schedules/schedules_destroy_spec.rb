require 'spec_helper'

describe Api::SchedulesController do
  include Devise::Test::ControllerHelpers

  describe '#destroy' do
    let(:user) { FactoryGirl.create(:user) }

    it 'deletes a schedule' do
      sign_in user
      schedule = FactoryGirl.create(:schedule, device: user.device)
      before = Schedule.count
      delete :destroy, id: schedule.id

      expect(response.status).to eq(200)
      expect(before > Schedule.count).to be_truthy
    end

    it 'prevents unauthorized deletion' do
      sign_in user
      schedule = FactoryGirl.create(:schedule)
      delete :destroy, id: schedule.id
      before = Schedule.count

      expect(response.status).to eq(403)
      expect(before == Schedule.count).to be_truthy
      expect(json[:error]).to include("Not your schedule.")
    end
  end
end
