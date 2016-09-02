
describe Schedule do
  describe '#calculate_next_occurence' do
    let(:schedule) { FactoryGirl.create(:schedule) }

    it 'indicates next_occurrence' do\
      actual = schedule.calculate_next_occurence
      expected = schedule.schedule_rules.next_occurrence
      expect(actual).to eq(expected)
    end
  end
end
