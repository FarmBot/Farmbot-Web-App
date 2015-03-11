RSpec.describe ScheduleSerializer do
  it 'accepts a :start and :end option' do
    params = { start_time: 5.days.ago, end_time: 5.days.from_now }
    schedule = FactoryGirl.build(:schedule, params)
    before = 2.days.ago.to_time
    after = 2.days.from_now.to_time
    serializer = ScheduleSerializer.new(schedule)
    serializer.options[:start] = before.as_json
    serializer.options[:finish] = after.as_json
    calendar = serializer.as_json[:schedule][:calendar]

    calendar.each do |time|
      valid = (time >= before) || (time <= after)
      expect(valid).to be_truthy
    end
  end
end
