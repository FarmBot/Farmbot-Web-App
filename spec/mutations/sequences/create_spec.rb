require 'spec_helper'

describe Steps::Create do
  let(:user) { FactoryGirl.create(:user) }
  let(:device) { user.device }
  let(:mutation) { Sequences::Create }
  let(:step) do
    { message_type: 'move_relative',
      command: { action: 'MOVE RELATIVE',
                 x: 1,
                 y: 2,
                 z: 3,
                 speed: 100,
                 delay: 0 } }
  end

  let(:valid_params) do
    { device: device,
      name: 'Hi.',
      steps: [step] }
  end

  it 'Builds a `sequence`' do
    seq = mutation.run!(valid_params)

    expect(seq.steps.count).to eq(1)
    expect(seq.name).to eq('Hi.')
    expect(seq.device).to eq(device)
  end
end
