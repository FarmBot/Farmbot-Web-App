require 'spec_helper'

describe Api::SchedulesController do
  include Devise::Test::ControllerHelpers

  describe 'Bot authentication' do

    let(:user) { FactoryGirl.create(:user) }
    let(:device) { user.device }

    it 'tells you why you failed to auth' do
      process :index, method: :get
      expect(response.status).to eq(401)
      expect(json[:error]).to include("failed to authenticate")
    end
  end
end
