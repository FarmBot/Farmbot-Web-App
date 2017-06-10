require 'spec_helper'
HAS_POINTS = JSON.parse(File.read("spec/lib/celery_script/ast_has_points.json"))

describe Api::SequencesController do
  before :each do
    request.headers["accept"] = 'application/json'
  end

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
           body: input.to_json,
           params: {format: :json}
      expect(response.status).to eq(200)
      expect(json[:args]).to be_kind_of(Hash)
      expect(json[:body]).to be_kind_of(Array)
      expect(json[:body].length).to eq(nodes.length)
    end

    it 'disregards extra attrs (like `uuid`) on sequence body nodes' do
      sign_in user
      input = { name: "Scare Birds",
                body: nodes }
      input[:body].first[:uuid] = SecureRandom.uuid
      input[:body].first["uuid"] = SecureRandom.uuid
      sequence_body_for(user)
      post :create,
           body: input.to_json,
           params: {format: :json}
      expect(response.status).to eq(200)
      expect(json[:args]).to be_kind_of(Hash)
      expect(json[:body]).to be_kind_of(Array)
      expect(json[:body].length).to eq(nodes.length)
    end

    it 'creates a new sequences for a user' do
      sign_in user
      input = { name: "Scare Birds", body: [] }
      post :create, body: input.to_json, format: :json
      expect(response.status).to eq(200)
    end

    it 'handles invalid params' do
      # Needed to test the `else` branch of mutate() somewhere
      sign_in user
      input = {}
      post :create, body: input.to_json, format: :json
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
           body: input.to_json,
           params: {format: :json}
      expect(response.status).to eq(200)
      new_count       = SequenceDependency.count
      validated_count = SequenceDependency.where(sequence_id: json[:id]).count
      expect(old_count < new_count).to be(true)
      expect(validated_count).to eq(new_count)
    end

    it 'tracks Points' do
      point = FactoryGirl.create(:point, device: user.device)
      SequenceDependency.destroy_all
      Sequence.destroy_all
      old_count = SequenceDependency.count
      HAS_POINTS["body"][0]["args"]["location"]["args"]["pointer_id"] =
        point.id
      sign_in user
      input = { name: "Scare Birds",
                body: HAS_POINTS["body"] }
      sequence_body_for(user)
      post :create,
           body: input.to_json,
           params: {format: :json}
      expect(response.status).to eq(200)
      new_count       = SequenceDependency.count
      validated_count = SequenceDependency.where(sequence_id: json[:id]).count
      expect(old_count).to be < new_count
      expect(validated_count).to eq(new_count)
      expect(SequenceDependency.last.dependency.id).to eq(point.id)
    end
  end
end
