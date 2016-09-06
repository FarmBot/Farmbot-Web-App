require 'spec_helper'

describe Sequences::Create do
  let(:user) { FactoryGirl.create(:user) }
  let(:device) { user.device }

  let(:step) do
    { message_type: 'move_relative',
      command: { action: 'MOVE RELATIVE',
                 x: 1,
                 y: 2,
                 z: 3,
                 speed: 100,
                 delay: 0 } }
  end

  name = Faker::Pokemon.name
  let(:sequence_params) do
    { device: device,
      name: name,
      steps: [step] }
  end

  it 'Builds a `sequence`' do
    seq = Sequences::Create.run!(sequence_params)
    expect(seq.steps.count).to eq(1)
    expect(seq.name).to eq(name)
    expect(seq.device).to eq(device)
  end
end
