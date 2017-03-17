require 'spec_helper'

describe Api::SyncsController do
  include Devise::Test::ControllerHelpers
  describe '#index' do

    let(:user) { FactoryGirl.create(:user) }
    it 'downloads a sync object' do
      sign_in user
      device_id = user.device.id

      get :show

      expect(response.status).to eq(200)
      expect(json).to be_a_kind_of(Hash)
    end
  end
end
