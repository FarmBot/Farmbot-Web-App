require 'spec_helper'

describe Api::DeviceCertsController do
  include Devise::Test::ControllerHelpers
  describe '#show' do
    let(:user) { FactoryBot.create(:user) }
    let(:device) { user.device }

    it 'shows an existing cert' do
      skip "brb"
      sign_in user
      get :show, params: { }
      expect(response.status).to eq(200)
      # expect(json[:id]).to eq(tool.id)
    end
  end
end
