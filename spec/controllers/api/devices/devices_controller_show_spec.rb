require 'spec_helper'

describe Api::DevicesController do

  include Devise::Test::ControllerHelpers

  let(:user) { FactoryGirl.create(:user) }

  describe '#show' do
    it 'handles deviceless requests' do
      user.update_attributes(device: nil)
      sign_in user
      get :show, params: {}, session: { format: :json }
      expect(response.status).to eq(422)
      expect(json[:error]).to include("You need to register a device first.")
    end

    it 'has expected keys' do
      sign_in user
      get :show, params: {}, session: { format: :json }
      { id:         Integer,
        name:       String,
        webcam_url: String }.each do |name, klass|
          expect(json[name]).to be_an_instance_of(klass)
        end

    end
  end
end
