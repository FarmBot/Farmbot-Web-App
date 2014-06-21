require 'spec_helper'

describe Api::DevicesController do

  include Devise::TestHelpers

  describe '#show' do

    let(:user) { FactoryGirl.create(:user) }

    it 'shows a single Device' do
      pending
      sign_in user
      get :show, {id: user.devices.first.id}
      shown = JSON.parse response.body
      expect(shown).to eq(user.devices.first.to_json)
      expect(response.status).to eq(204)
    end
  end
end