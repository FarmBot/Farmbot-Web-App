
describe Schedule do
  describe '#calculate_next_occurence' do
    let(:schedule) { FactoryGirl.create(:schedule) }

    it 'indicates next_occurrence' do
      expect(schedule.calculate_next_occurence.day).to eq(Date.today.day)
    end
  end
end
