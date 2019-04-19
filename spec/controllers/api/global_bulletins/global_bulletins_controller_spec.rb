require "spec_helper"

describe Api::GlobalBulletinsController do
  include Devise::Test::ControllerHelpers

  describe "#show" do
    it "shows bulletins" do
      gb = FactoryBot.create(:global_bulletin)
      get :show, params: { id: gb.slug }
      expect(response.status).to eq(200)
      keys = [:content, :href, :slug, :type, :title]
      keys.map { |k| expect(json[k]).to eq(gb[k]) }
    end
  end
end
