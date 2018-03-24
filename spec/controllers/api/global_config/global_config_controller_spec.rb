require 'spec_helper'

describe Api::GlobalConfigController do
  include Devise::Test::ControllerHelpers

  describe '#show' do
    it 'shows / updates configs' do
      conf = GlobalConfig.create!(key: "DYNAMIC", value: "Yup!")
      get :show
      expect(json[:DYNAMIC]).to eq("Yup!")
      conf.update_attributes!(value: "Still dynamic!")
      GlobalConfig.reload
      get :show
      json
      sleep 0.2 # WHY!?
      expect(json[:DYNAMIC]).to eq("Still dynamic!")
    end
  end
end
