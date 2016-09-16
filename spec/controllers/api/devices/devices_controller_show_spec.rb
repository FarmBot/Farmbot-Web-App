require 'spec_helper'

describe Api::DevicesController do

  include Devise::Test::ControllerHelpers

  let(:user) { FactoryGirl.create(:user) }

  describe '#show' do
    it 'handles deviceless requests' do
      user.update_attributes(device: nil)
      sign_in user
      get :show, {}, format: :json
      expect(user.reload.device).to be_kind_of(Device)
    end

    it 'has expected keys' do
      sign_in user
      get :show, {}, format: :json
      { id:         Fixnum,
        name:       String,
        uuid:       String,
        webcam_url: String }.each{ |name, klass|
          expect(json[name]).to be_an_instance_of(klass)
        }
      
    end
  end
end
