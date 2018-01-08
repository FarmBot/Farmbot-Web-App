require 'spec_helper'

describe Api::FbosConfigsController do

  include Devise::Test::ControllerHelpers

  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }

  describe '#show' do
    it 'handles requests' do
      sign_in user
      get :show, format: :json
      binding.pry
    end
  end

  describe '#update' do
    it 'handles requests'
  end

  describe '#delete' do
    it 'resets everything to the defaults'
  end
end
