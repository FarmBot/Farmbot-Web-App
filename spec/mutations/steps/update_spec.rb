require 'spec_helper'

describe Steps::Update do
  let(:user) { FactoryGirl.create(:user) }
  let(:mutation) { Steps::Update }
  let(:sequence) { FactoryGirl.create(:sequence, user: user) }

  it 'automatically populates position field via black magic.' do
    pink   = sequence.steps.first
    red    = Step.create(sequence: sequence, message_type: 'pin_write')
    orange = Step.create(sequence: sequence, message_type: 'pin_write')
    green  = Step.create(sequence: sequence, message_type: 'pin_write')
    blue   = Step.create(sequence: sequence, message_type: 'pin_write')
    expectation = [pink, red, orange, green, blue]
    expect(sequence.steps.sort).to eq(expectation)

    Steps::Update.run!(step_params: {position: 1}, step: blue)
    expect(blue.reload.position).to eq(1)
    expect(blue.next_steps).to_not include(blue)
    expect(blue.next_steps.count).to eq(4)
    expect(blue.next_steps).to include(pink)
    expect(blue.next_steps).to include(red)
    expect(blue.next_steps).to include(orange)
    expect(blue.next_steps).to include(green)
    expectation = [blue, pink, red, orange, green,]
                    .map(&:reload)
                    .map(&:position)
                    .sort
    expect(sequence.steps.pluck(:position).sort).to eq(expectation)
  end
end
