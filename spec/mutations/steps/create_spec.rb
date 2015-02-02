require 'spec_helper'

describe Steps::Create do
  let(:user) { FactoryGirl.create(:user) }
  let(:mutation) { Steps::Create }
  let(:valid_params) { {message_type: 'move_rel',
                        sequence: FactoryGirl.create(:sequence),
                        command: {action: 'MOVE RELATIVE',
                                  x: 1,
                                  y: 2,
                                  z: 3,
                                  speed: 100,
                                  delay: 0}} }
  let(:sequence) { valid_params[:sequence] }

  it 'Builds an instance of `step`' do
    outcome = mutation.run(valid_params)
    expect(outcome.success?).to be_truthy
    expect(outcome.result.message_type).to eq(valid_params[:message_type])
    expect(outcome.result.sequence).to eq(valid_params[:sequence])
    cmd = outcome.result.command.deep_symbolize_keys
    expect(cmd).to eq(valid_params[:command])
    expect(sequence.steps.order_by(position: 1).last).to eq(outcome.result)
  end

  it 'inserts new steps at a specified index' do
    my_params = valid_params.merge(position: 2)
    step = mutation.run!(my_params)
    expect(step.position).to eq(2)
  end
end
