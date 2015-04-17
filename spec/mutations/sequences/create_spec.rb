require 'spec_helper'

describe Steps::Create do
  let(:user) { FactoryGirl.create(:user) }
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
    { user: user,
      name: 'Hi.',
      steps: [step] }
  end

  it 'Builds a `sequence`' do
    outcome = mutation.run(valid_params)
    expect(outcome.success?).to be_truthy
    seq = outcome.result

    expect(seq.steps.count).to eq(1)
    expect(seq.name).to eq('Hi.')
    expect(seq.user).to eq(user)
  end
end
