require 'spec_helper'

describe Api::SchedulesController do
  include Devise::TestHelpers

  describe 'Bot authentication' do

    let(:device) { FactoryGirl.create(:device) }

    it 'authorizes using MeshBlu UUID / Token' do
      @request.headers["HTTP_BOT_TOKEN"] = device.token
      @request.headers["HTTP_BOT_UUID"]  = device.uuid
      get :index
      expect(subject.current_user).to eq(device.user)
    end

    it 'tells you why you failed to auth' do
      get :index
      expect(response.status).to eq(401)
      expect(json[:error]).to include("failed to authenticate")
    end

    it 'handles bad credentials' do
      @request.headers["HTTP_BOT_TOKEN"] = '321'
      @request.headers["HTTP_BOT_UUID"]  = '123'
      get :index
      expect(response.status).to eq(401)
      expect(json[:error]).to include("failed to authenticate")
    end
  end
end
