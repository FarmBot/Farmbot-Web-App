require 'spec_helper'

describe Api::SequencesController do

  include Devise::Test::ControllerHelpers

  describe '#create' do
    let(:user) { FactoryGirl.create(:user) }
    let(:nodes) { sequence_body_for(user) }

    it 'handles a well formed AST in the body attribute' do
      sign_in user
      input = { name: "Scare Birds",
                body: nodes }
      sequence_body_for(user)
      post :create,
           input.merge(format: :json)
      expect(response.status).to eq(200)
      expect(json[:args]).to be_kind_of(Hash)
      expect(json[:body]).to be_kind_of(Array)
      expect(json[:body].length).to eq(nodes.length)      
    end

    it 'creates a new sequences for a user' do
      sign_in user
      input = { name: "Scare Birds", body: [] }
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

    it 'tracks SequenceDependency' do
      SequenceDependency.destroy_all
      old_count = SequenceDependency.count
      sign_in user
      input = { name: "Scare Birds",
                body: nodes }
      sequence_body_for(user)
      post :create,
           input.merge(format: :json)
      expect(response.status).to eq(200)
      new_count       = SequenceDependency.count
      validated_count = SequenceDependency.where(sequence_id: json[:id]).count
      expect(old_count < new_count).to be(true)
      expect(validated_count).to eq(new_count)
    end
  end
end
