require "spec_helper"

describe Devices::Watchdog do
  it "barks at devices when they go offline > 8 hours" do
    destroy_everything!
    too_old = FactoryBot
      .create(:user)
      .device
      .update!(last_saw_api: 3.days.ago, name: "too_old")
    woof_woof = FactoryBot
      .create(:user)
      .device
      .update!(last_saw_api: 17.hours.ago,
               first_saw_api: 3.days.ago,
               name: "woof_woof",
               last_ota_attempt_at: 16.hours.ago)
    too_soon = FactoryBot
      .create(:user)
      .device
      .update!(last_saw_api: 6.hours.ago, name: "too_soon")
    actual = Devices::Watchdog.run!().map(&:device).map(&:name)
    expect(actual).to eq(["woof_woof"])
  end
end
