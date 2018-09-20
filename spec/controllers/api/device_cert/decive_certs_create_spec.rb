require 'spec_helper'

describe Api::DeviceCertsController do
  include Devise::Test::ControllerHelpers
  describe '#create' do
    let(:user) { FactoryBot.create(:user) }
    let(:device) { user.device }

    it 'creates a cert' do
      skip "brb"
      sign_in user
      payload = {}
      post :create, body: payload.to_json, params: {format: :json}
      expect(response.status).to eq(200)
    end
  end
end
