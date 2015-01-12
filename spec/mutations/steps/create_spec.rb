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

  it 'Builds an instance of `step`' do
    outcome = mutation.run(valid_params)
    expect(outcome.success?).to be_truthy
    expect(outcome.result.message_type).to eq(valid_params[:message_type])
    expect(outcome.result.sequence).to eq(valid_params[:sequence])
    cmd = outcome.result.command.deep_symbolize_keys
    expect(cmd).to eq(valid_params[:command])
  end
end
