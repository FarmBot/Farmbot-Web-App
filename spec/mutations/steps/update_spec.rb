require 'spec_helper'

describe Steps::Update do
  let(:user) { FactoryGirl.create(:user) }
  let(:mutation) { Steps::Update }
  let(:sequence) { FactoryGirl.create(:sequence, user: user) }

  it 'reorders its friggin step order' do
    pink   = sequence.steps.first
    red    = Step.create(sequence: sequence, message_type: 'pin_write')
    orange = Step.create(sequence: sequence, message_type: 'pin_write')
    green  = Step.create(sequence: sequence, message_type: 'pin_write')
    blue   = Step.create(sequence: sequence, message_type: 'pin_write')
    expectation = [pink, red, orange, green, blue]
    expect(sequence.steps.sort).to eq(expectation)

    Steps::Update.run!(step_params: {position: 1}, step: blue)
    expectation = [blue, pink, red, orange, green,]
    sequence.reload
    expect(sequence.steps.sort).to eq(expectation)

  end
end
