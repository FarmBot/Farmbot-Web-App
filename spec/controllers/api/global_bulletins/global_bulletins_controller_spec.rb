require "spec_helper"

describe Api::GlobalBulletinsController do
  include Devise::Test::ControllerHelpers

  describe "#show" do
    it "shows bulletins" do
      gb = FactoryBot.create(:global_bulletin)
      get :show, params: { id: gb.slug }, format: :json
      expect(response.status).to eq(200)
    end
  end
end
