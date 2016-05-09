require 'spec_helper'

describe Api::DevicesController do

  include Devise::TestHelpers

  let(:user) { FactoryGirl.create(:user) }

  describe '#show' do
    it 'handles deviceless requests' do
      user.update_attributes(device: nil)
      sign_in user
      get :show, {}, format: :json
      expect(user.reload.device).to be_kind_of(Device)
    end
  end
end
