require 'spec_helper'

describe Api::SchedulesController do
  include Devise::TestHelpers

  describe '#update' do
    let(:user) { FactoryGirl.create(:user) }

    it 'prevents unauthorized modification' do
      sign_in user
      id = FactoryGirl.create(:schedule, user: user)._id.to_s
      input = { id: id, schedule: { repeat: 66 } }
      patch :update, input
      expect(response.status).to eq(200)
    end

    it 'prevents unauthorized modification' do
      sign_in user
      id = FactoryGirl.create(:schedule)._id.to_s
      input = { id: id, repeat: 66 }
      patch :update, input
      expect(response.status).to eq(403)
      expect(json[:error]).to include('Not your schedule')
    end
  end
end
