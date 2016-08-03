require 'spec_helper'

describe Api::DevicesController do

  include Devise::Test::ControllerHelpers

  describe '#destroy' do

    let(:user) { FactoryGirl.create(:user) }

    it 'destroys a Device' do
      sign_in user
      old_bot = user.device
      delete :destroy, id: user.device.id, fromat: :json
      user.reload
      expect(user.device._id).not_to eq(old_bot._id)
      expect(response.status).to eq(204)
    end
  end
end
