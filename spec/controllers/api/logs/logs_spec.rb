require 'spec_helper'

describe Api::LogsController do
  include Devise::Test::ControllerHelpers
  let(:user) { FactoryGirl.create(:user) }
  let!(:logs) { FactoryGirl.create_list(:log, 5, device: user.device) }

  describe '#index' do
    it 'lists last x logs' do
      sign_in user
      get :index
      expect(response.status).to eq(200)
      expect(json.first[:id]).to eq(logs.first.id)
      expect(json.first[:created_at]).to eq(logs.first.created_at.to_i)
      expect(json.last[:meta][:type]).to eq(logs.last.meta[:type])
    end
  end

  describe "#create" do
    # it 'creates one log' do
    #   sign_in user
    #   post :create,
    #        body: {}.to_json,
    #        params: {format: :json}
    #   expect(response.status).to eq(200)
    # end

    it 'creates many logs (with an Array)' do
      sign_in user
      post :create,
           body: [].to_json,
           params: {format: :json}
      expect(response.status).to eq(200)
    end
  end
end
