require 'spec_helper'

describe Steps::Update do
  let(:user) { FactoryGirl.create(:user) }
  let(:device) { user.device }
  let(:mutation) { Steps::Update }
  let(:sequence) { FactoryGirl.create(:sequence, device: device) }

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
    expect(sequence.steps.pluck(:position).sort).to eq([0,1,2,3,4])
    expect(sequence.steps.find_by(position: 0)).to eq(pink)
    expect(blue.position).to             eq(1)
    expect(sequence.steps.find_by(position: 2)).to eq(red)
    expect(sequence.steps.find_by(position: 3)).to eq(orange)
    expect(sequence.steps.find_by(position: 4)).to eq(green)
    # Current order is:

    # Move orange ==> pink
    # precondition: pink, blue, red, orange, green,
    # postcondtion: blue, red, pink, orange, green,
    Steps::Update.run!(step_params: {position: 2}, step: pink)
    expect(sequence.steps.pluck(:position).sort).to eq([0,1,2,3,4])
    expect(sequence.steps.find_by(position: 0)).to eq(blue)
    expect(sequence.steps.find_by(position: 1)).to eq(red)
    expect(sequence.steps.find_by(position: 2)).to eq(pink)
    expect(sequence.steps.find_by(position: 3)).to eq(orange)
    expect(sequence.steps.find_by(position: 4)).to eq(green)
  end

  it 'moves first to middle' do
    sequence = Sequences::Create.run!(name: 'test', device: device)

    a = Steps::Create.run!(message_type: 'pin_write',
                          sequence: sequence,
                          command: {name: :a})
    b = Steps::Create.run!(message_type: 'pin_write',
                          sequence: sequence,
                          command: {name: :b})
    c = Steps::Create.run!(message_type: 'pin_write',
                          sequence: sequence,
                          command: {name: :c})

    expect(sequence.steps).to eq([a, b, c])
    expect(a.position).to eq(0)
    expect(b.position).to eq(1)
    expect(c.position).to eq(2)

    Steps::Update.run!(step: c, step_params: {position: 0})
    expect(c.position).to eq(0)
    expect(a.position).to eq(1)
    expect(b.position).to eq(2)

    Steps::Update.run!(step: c, step_params: {position: 1})
    expect(a.position).to eq(0)
    expect(c.position).to eq(1)
    expect(b.position).to eq(2)

    Steps::Update.run!(step: b, step_params: {position: 1})
    expect(a.position).to eq(0)
    expect(b.position).to eq(1)
    expect(c.position).to eq(2)

    Steps::Update.run!(step: a, step_params: {position: 1})
    expect(b.position).to eq(0)
    expect(a.position).to eq(1)
    expect(c.position).to eq(2)

    Steps::Update.run!(step: a, step_params: {position: 0})
    expect(a.position).to eq(0)
    expect(b.position).to eq(1)
    expect(c.position).to eq(2)

    Steps::Update.run!(step: a, step_params: {position: 2})
    expect(b.position).to eq(0)
    expect(c.position).to eq(1)
    expect(a.position).to eq(2)

    Steps::Update.run!(step: b, step_params: {position: 2})
    expect(c.position).to eq(0)
    expect(a.position).to eq(1)
    expect(b.position).to eq(2)

    Steps::Update.run!(step: b, step_params: {position: 0})
    expect(b.position).to eq(0)
    expect(c.position).to eq(1)
    expect(a.position).to eq(2)

    Steps::Update.run!(step: a, step_params: {position: 0})
    expect(a.position).to eq(0)
    expect(b.position).to eq(1)
    expect(c.position).to eq(2)

    Steps::Update.run!(step: a, step_params: {position: 2})
    expect(b.position).to eq(0)
    expect(c.position).to eq(1)
    expect(a.position).to eq(2)

    Steps::Update.run!(step: b, step_params: {position: 2})
    expect(c.position).to eq(0)
    expect(a.position).to eq(1)
    expect(b.position).to eq(2)

    Steps::Update.run!(step: a, step_params: {position: 1})
    expect(c.position).to eq(0)
    expect(a.position).to eq(1)
    expect(b.position).to eq(2)

  end
end
