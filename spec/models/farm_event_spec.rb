require "spec_helper"
describe FarmEvent do
  describe '#calculate_next_occurence' do
    let(:farm_event) { FactoryGirl.create(:farm_event) }

    it 'indicates next_occurrence' do\
      actual = farm_event.calculate_next_occurence
      expected = farm_event.farm_event_rules.next_occurrence
      expect(actual).to eq(expected)
    end

    it 'calculates time between two dates' do
      # binding.pry
    end
  end
end
