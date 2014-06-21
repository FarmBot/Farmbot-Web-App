require 'spec_helper'

describe Api::DevicesController do

  include Devise::TestHelpers

  describe '#destroy' do

    let(:user) { FactoryGirl.create(:user) }

    it 'destroys a Device' do
      sign_in user
      delete :destroy, id: user.devices.first.id, fromat: :json
      user.reload
      expect(user.devices.count).to eq(0)
      expect(response.status).to eq(204)
    end
  end
end