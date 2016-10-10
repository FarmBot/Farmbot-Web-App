require 'spec_helper'

describe Api::SequencesController do

  include Devise::Test::ControllerHelpers

  describe '#create' do
    let(:nodes) {
      JSON.parse(File.read("./spec/mutations/sequences/ast_fixture.json"))
    }

    let(:user) { FactoryGirl.create(:user) }

    it 'handles a well formed AST in the body attribute' do
      sign_in user
      input = { name: "Scare Birds",
                body: nodes }
      post :create,
           input.merge(format: :json)
      expect(response.status).to eq(200)
      expect(json[:args]).to be_kind_of(Hash)
      expect(json[:body]).to be_kind_of(Array)
      expect(json[:body].length).to eq(nodes.length)      
    end

    it 'creates a new sequences for a user' do
      sign_in user
      input = { name: "Scare Birds" }
      post :create, input
      expect(response.status).to eq(200)
    end

    it 'handles invalid params' do
      # Needed to test the `else` branch of mutate() somewhere
      sign_in user
      input = {}
      post :create, input
      expect(response.status).to eq(422)
      expect(json[:name]).to eq("Name is required")
    end
  end
end
