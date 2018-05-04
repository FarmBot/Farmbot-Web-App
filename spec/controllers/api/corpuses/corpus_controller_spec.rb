require 'spec_helper'

describe Api::CorpusesController do
  include Devise::Test::ControllerHelpers

  describe '#show' do
    it 'renders one corpus' do
      get :show
      expect(json.keys).to eq([:tag, :args, :nodes])
    end
  end
end
