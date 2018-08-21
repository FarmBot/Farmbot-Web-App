require 'spec_helper'

describe "Celery Script `point` node" do
  let(:plant) { FactoryBot.create(:plant) }
  let(:hash) do
    { kind: "sequence",
      args: Sequence::DEFAULT_ARGS,
      body: [
        {
          kind:"move_absolute",
          args:{
            location: {
              kind:"point",
              args: { pointer_type: plant.class.to_s,
                      pointer_id:   plant.id }
            },
            offset:{ kind:"coordinate", args:{ x: 0, y: 0, z: 0} },
            speed: 100
          }
        }
      ]
    }.deep_symbolize_keys
  end

  let(:tree)    { CeleryScript::AstNode.new(hash) }
  let(:corpus)  { Sequence::Corpus }
  let(:device)  { plant.device }
  let(:checker) { CeleryScript::Checker.new(tree, corpus, device) }

  it 'handles the corner case' do
    expect { checker.run! }.not_to raise_error
  end

  it 'handles bad types' do
    hash[:body][0][:args][:location][:args][:pointer_type] = "wrong"
    expect(checker.run.message).to include("not a type of point")
  end

  it 'handles bad ids' do
    hash[:body][0][:args][:location][:args][:pointer_id] = -9
    expect(checker.run.message).to include("Bad point ID")
  end
end
