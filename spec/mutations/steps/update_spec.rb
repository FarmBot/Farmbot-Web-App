require 'spec_helper'

describe Steps::Update do
  let(:user) { FactoryGirl.create(:user) }
  let(:mutation) { Steps::Update }
  let(:sequence) { FactoryGirl.create(:sequence, user: user) }

  it 'automatically populates position field via black magic.' do
    # This feature is a crime against humanity. Sorry :(
    pink   = sequence.steps.first
    red    = Step.create(sequence: sequence, message_type: 'pin_write')
    orange = Step.create(sequence: sequence, message_type: 'pin_write')
    green  = Step.create(sequence: sequence, message_type: 'pin_write')
    blue   = Step.create(sequence: sequence, message_type: 'pin_write')
    expectation = [pink, red, orange, green, blue]
    expect(sequence.steps.sort).to eq(expectation)

    # Move last ==> first
    Steps::Update.run!(step_params: {position: 1}, step: blue)
    expect(blue.reload.position).to eq(1)
    expect(blue.next_steps).to_not include(blue)
    expect(blue.next_steps.count).to eq(4)
    expect(blue.next_steps).to include(pink)
    expect(blue.next_steps).to include(red)
    expect(blue.next_steps).to include(orange)
    expect(blue.next_steps).to include(green)

    expect(sequence.steps.find_by(position: 2)).to eq(pink)
    expect(sequence.steps.find_by(position: 3)).to eq(red)
    expect(sequence.steps.find_by(position: 4)).to eq(orange)
    expect(sequence.steps.find_by(position: 5)).to eq(green)
    # Current order is: blue, pink, red, orange, green

    # Move orange ==> pink
    # Expected order: blue, orange, pink, red, green
    Steps::Update.run!(step_params: {position: 2}, step: orange)
    expect(orange.next_steps).to_not include(blue)
    expect(orange.next_steps).to_not include(orange)
    expect(orange.next_steps.count).to eq(3)
    expect(orange.next_steps).to include(pink)
    expect(orange.next_steps).to include(red)
    expect(orange.next_steps).to include(green)

    expect(sequence.steps.find_by(position: 1)).to eq(blue)
    expect(sequence.steps.find_by(position: 2)).to eq(orange)
    expect(sequence.steps.find_by(position: 3)).to eq(pink)
    expect(sequence.steps.find_by(position: 4)).to eq(red)
    expect(sequence.steps.find_by(position: 5)).to eq(green)
  end
end
