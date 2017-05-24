require 'spec_helper'

describe EmailNotifications::Create do
  let(:device) { FactoryGirl.create(:device)}
# USE CASES:
#  * User needs it NOW => Send it now
#  * User wrote a runaway recursive sequence. => Rate limit exceeded
#      * Throttle with Rack::Attack
#  *
  it 'sends notifications' do
    pending
    results = EmailNotifications::Create.run(device: device)
  end
  it 'batches multiple requests into one'

end
