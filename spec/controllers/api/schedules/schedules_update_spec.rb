require 'spec_helper'

describe Api::SchedulesController do
  include Devise::Test::ControllerHelpers

  describe '#update' do
    let(:user) { FactoryGirl.create(:user) }

    it 'allows authorized modification' do
      sign_in user
      id = FactoryGirl.create(:schedule, device: user.device).id
      input = { id: id, schedule: { repeat: 66 } }
      patch :update, params: input
      expect(response.status).to eq(200)
    end

    it 'prevents unauthorized modification' do
      sign_in user
      id = FactoryGirl.create(:schedule).id
      input = { id: id, repeat: 66 }
      patch :update, params: input
      expect(response.status).to eq(403)
      expect(json[:error]).to include('Not your schedule')
    end
  end
end
