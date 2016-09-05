require 'spec_helper'

describe Regimens::Create do
  let(:sequence) { FactoryGirl.create(:sequence) }
  let(:device) { sequence.device }
  let(:sequence2) { FactoryGirl.create(:sequence, device: sequence.device) }

  it 'updates a regimen' do
    # input = {
    #     device: device,
    #     name: "My Second Regimen",
    #     color: "red",
    #     regimen_items: => [
    #         {
    #             time_offset: 518700000,
    #             sequence_id: 1
    #         },
    #         {
    #             time_offset: 864300000,
    #             sequence_id: 1
    #         },
    #         {
    #             time_offset: 86700000,
    #             sequence_id: 1
    #         }
    #    ]}
    # result = Regimens::Update.run!(input).reload
  end
end
