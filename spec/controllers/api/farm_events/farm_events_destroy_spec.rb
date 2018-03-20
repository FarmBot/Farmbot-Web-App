require 'spec_helper'

describe Api::FarmEventsController do
  include Devise::Test::ControllerHelpers

  describe '#destroy' do
    let(:user) { FactoryBot.create(:user) }

    it 'deletes a farm_event' do
      sign_in user
      farm_event = FactoryBot.create(:farm_event, device: user.device)
      before     = FarmEvent.count
      delete :destroy, params: { id: farm_event.id }

      expect(response.status).to eq(200)
      expect(before > FarmEvent.count).to be_truthy
    end

    it 'prevents unauthorized deletion' do
      sign_in user
      farm_event = FactoryBot.create(:farm_event)
      delete :destroy, params: { id: farm_event.id }
      before = FarmEvent.count

      expect(response.status).to eq(403)
      expect(before == FarmEvent.count).to be_truthy
      expect(json[:error]).to include("Not your farm_event.")
    end
  end
end
