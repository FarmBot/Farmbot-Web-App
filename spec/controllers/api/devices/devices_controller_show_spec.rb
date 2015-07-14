require 'spec_helper'

describe Api::DevicesController do

  include Devise::TestHelpers

  let(:user) { FactoryGirl.create(:user) }

  describe '#show' do
    it 'handles deviceless requests' do
      user.update_attributes(device: nil)
      sign_in user
      get :show, {}, format: :json
      expect(json[:error]).to eq("add device to account")
      expect(response.status).to eq(404)
    end
  end
end
