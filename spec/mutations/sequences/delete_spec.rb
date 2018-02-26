require "spec_helper"

describe Sequences::Delete do
  let(:sequence)     { FactoryBot.create(:sequence)  }

  it "Cant delete sequences in use by farm events" do
    FactoryBot.create(:farm_event, executable: sequence)
    result = Sequences::Delete.run(device: sequence.device, sequence: sequence)
    expect(result.success?).to be false
    errors = result.errors.message
    expect(errors.keys).to include("sequence")
    expect(errors["sequence"]).to include("in use by some farm events")
  end

  it "refuses to delete a sequence that a regimen depends on" do
    regimen_item1 = FactoryBot.create(:regimen_item, sequence: sequence)
    regimen_item2 = FactoryBot.create(:regimen_item, sequence: sequence)
    expect(sequence.regimen_items.count).to eq(2)
    result = Sequences::Delete.run(device: sequence.device, sequence: sequence)
    expect(result.success?).to be false
    errors = result.errors.message
    expect(errors.keys).to include("sequence")
    expect(errors["sequence"]).to include("regimens are still relying on " +
                                          "this sequence")
  end

  it "deletes a sequence" do
    result = Sequences::Delete.run!(device: sequence.device, sequence: sequence)
    expect(result).to eq("")
    expect( Sequence.where(id: sequence.id).count ).to eq(0)
  end

  it "prevents deletion when the sequence is in use by another sequence" do
    Sequences::Create.run!(device: sequence.device,
                           name: "dep",
                           body: [
                            {
                              kind: "execute",
                              args: { sequence_id: sequence.id }
                            }
                          ])
    result = Sequences::Delete.run(device: sequence.device, sequence: sequence)
    expect(result.success?).to be(false)
    expect(result.errors.has_key?("sequence")).to be(true)
    message = result.errors["sequence"].message
    expect(message).to include("sequences are still relying on this sequence")
  end
end
