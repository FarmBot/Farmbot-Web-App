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
    it 'creates one log' do
      sign_in user
      before_count = Log.count
      post :create,
           body: { meta: { x: 1, y: 2, z: 3, type: "fun" },
                   channels: ["toast"],
                   message: "Hello, world!"
                 }.to_json,
           params: {format: :json}
      expect(response.status).to eq(200)
      expect(Log.count).to be > before_count
      expect(Log.last.message).to eq("Hello, world!")
      expect(Log.last.device).to eq(user.device)      
    end

    it 'creates many logs (with an Array)' do
      sign_in user
      before_count = Log.count
      post :create,
           body: [
            { meta: { x: 1, y: 2, z: 3, type: "fun" },
              channels: ["toast"],
              message: "one" },
            { meta: { x: 1, y: 2, z: 3, type: "fun" },
              channels: ["toast"],
              message: "two" },
            { meta: { x: 1, y: 2, z: 3, type: "fun" },
              channels: ["toast"],
              message: "three" },
           ].to_json,
           params: {format: :json}
      expect(response.status).to eq(200)
      expect(Log.count).to eq(before_count + 3)
    end
  end
end
