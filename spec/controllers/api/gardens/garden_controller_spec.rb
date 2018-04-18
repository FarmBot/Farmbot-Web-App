require 'spec_helper'

describe Api::GardensController do
  include Devise::Test::ControllerHelpers

  describe '#index' do
    let(:user)    { FactoryBot.create(:user) }
    let(:gardens) { FactoryBot.create_list(:garden, 3, device: user.device) }

    it 'shows all gardens' do
      sign_in user
      garden_size = gardens.length
      get :index
      expect(response.status).to be(200)
      expect(json.length).to be(garden_size)
    end
  end
end
