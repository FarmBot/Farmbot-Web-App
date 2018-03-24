require 'spec_helper'

describe Api::GlobalConfigController do
  include Devise::Test::ControllerHelpers

  describe '#show' do
    conf = GlobalConfig.create!(key:   "PING",
                                value: "INITIAL_" + SecureRandom.hex)

    it 'shows configs' do
      get :show
      expect(json[:PING]).to eq(GlobalConfig.find_by(key: "PING").value)
    end

    it 'changes configs dynamically' do
      value = SecureRandom.hex
      conf.update_attributes!(value: value)
      GlobalConfig.reload_
      get :show
      expect(json[:PING]).to eq(value)
    end
  end
end
