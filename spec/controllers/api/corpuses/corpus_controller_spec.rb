require 'spec_helper'

describe Api::CorpusesController do
  include Devise::Test::ControllerHelpers

  describe '#show' do
    it 'renders one corpus' do
      get :show
      expect(json.keys).to eq([:version, :enums, :values, :args, :nodes])
      node_keys = json.fetch(:nodes).first.keys.sort
      expect(node_keys).to eq([:allowed_args, :allowed_body_types, :docs, :name, :tags])
    end
  end
end
