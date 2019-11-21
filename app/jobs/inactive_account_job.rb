# Recurring task that deletes inactive accounts.
class InactiveAccountJob < ApplicationJob
  queue_as :default
  LIMIT = 1000
  INACTIVE_WITH_DEVICE = 11.months + 15.days
  INACTIVE_NO_DEVICE = 2.months + 15.days

  def perform
    notify_old_accounts
    delete_old_accounts
  end

  private

  def notify_old_accounts
    all_inactive
      .where(inactivity_warning_sent_at: nil)
      .map(&:send_inactivity_warning)
  end

  def delete_old_accounts
    all_inactive
      .where
      .not(inactivity_warning_sent_at: nil)
      .where("inactivity_warning_sent_at < ?", 14.days.ago)
      .map(&:deactivate_account)
  end

  # Returns a Map. Key is the number of warnings sent, value is a User object
  # (not a device, but device is preloaded)
  def all_inactive
    return @all_inactive if @all_inactive
    users = User.includes(:device)

    # They signed up for an account, but never configured a device.
    no_device = users
      .where("devices.fbos_version" => nil)
      .references(:devices)

    # They signed up for an account and once had a working device.
    ok_device = users
      .where
      .not("devices.fbos_version" => nil)
      .references(:devices)

    inactive_3mo = no_device
      .where("last_sign_in_at < ?", INACTIVE_NO_DEVICE.ago)
    inactive_11mo = ok_device
      .where("last_sign_in_at < ?", INACTIVE_WITH_DEVICE.ago)
    @all_inactive = inactive_11mo
      .or(inactive_3mo)
      .order("RANDOM()")
      .limit(LIMIT)
  end
end
