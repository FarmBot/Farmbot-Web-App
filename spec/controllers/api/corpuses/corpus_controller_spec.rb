require 'spec_helper'

describe Api::CorpusesController do
  include Devise::Test::ControllerHelpers

  describe '#show' do
    it 'renders one corpus' do
      get :show, params: {id: 123}
      expect(json.keys).to eq([:tag, :args, :nodes])
    end
  end

  describe "#index" do
    it 'renders all corpuses' do
      get :index
      expect(json.length).to eq(1)
      expect(json.first.keys).to eq([:tag, :args, :nodes])
    end
  end
end
