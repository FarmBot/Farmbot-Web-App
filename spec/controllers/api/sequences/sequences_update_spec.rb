require 'spec_helper'

describe Api::SequencesController do
  include Devise::Test::ControllerHelpers
  let(:nodes) { sequence_body_for(user) }

  describe '#update' do

    let(:user) { FactoryBot.create(:user) }

    it 'doesnt allow nonsense in `sequence.args.locals`' do
      sign_in user
      sequence = FactoryBot.create(:sequence, device: user.device)
      input = { id: sequence.id,
                sequence: { name: "Wrong `locals` declaration",
                            body: [],
                            args: { locals: {} } } }
      patch :update, params: {id: sequence.id }, body: input.to_json, as: :json
      expect(response.status).to eq(422)
      expect(json[:body]).to include("leaf 'locals' within 'sequence'")
      expect(json[:body]).to include("but got Hash")
    end

    it 'updates existing sequences' do
      sign_in user
      sequence = FactoryBot.create(:sequence, device: user.device)
      input = { sequence: { name: "Scare Birds" } }
      params = { id: sequence.id }
      patch :update,
        params: params,
        body: input.to_json,
        format: :json
      expect(response.status).to eq(200)
      sequence.reload
      expect(sequence.name).to eq(input[:sequence][:name])
    end
  end
end
