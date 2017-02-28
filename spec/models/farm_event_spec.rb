require "spec_helper"
describe FarmEvent do
  describe '#calculate_next_occurence' do
    let(:farm_event) { FactoryGirl.create(:farm_event) }

    it 'indicates next_occurrence' do
      pending("Probably going away.")
      actual = farm_event.calculate_next_occurence
      expected = farm_event.farm_event_rules.next_occurrence
      expect(actual).to eq(expected)
    end
  end
end
