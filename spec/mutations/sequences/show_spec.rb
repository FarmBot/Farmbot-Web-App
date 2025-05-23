require "spec_helper"

describe Sequences::Show do
  let(:user) { FactoryBot.create(:user) }
  let(:sequence) { FakeSequence.create(device: user.device) }

  describe "#sequence_version" do
    it "returns the associated sequence_version if association is loaded" do
      allow(sequence.association(:sequence_version)).to receive(:loaded?).and_return(true)
      instance = Sequences::Show.new(sequence: sequence)
      expect(instance.sequence_version).to eq(sequence.sequence_version)
    end
  end

  describe "#sequence_publication" do
    it "returns the associated sequence_publication if association is loaded" do
      allow(sequence.association(:sequence_publication)).to receive(:loaded?).and_return(true)
      instance = Sequences::Show.new(sequence: sequence)
      expect(instance.sequence_publication).to eq(sequence.sequence_publication)
    end
  end
end
