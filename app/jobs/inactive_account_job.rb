# Recurring task that deletes inactive accounts.
class InactiveAccountJob < ApplicationJob
  queue_as :default
  LIMIT = 1000
  ORDER = "RANDOM()"
  INACTIVE_WITH_DEVICE = 11.months + 15.days
  INACTIVE_NO_DEVICE = 2.months + 15.days
  WARNING_TIME = 14.days

  def users
    User.includes(:device)
  end

  # They signed up for an account, but never configured a device.
  def no_device
    users
      .where("devices.fbos_version" => nil)
      .references(:devices)
  end

  # They signed up for an account and once had a working device.
  def ok_device
    users
      .where
      .not("devices.fbos_version" => nil)
      .references(:devices)
  end

  def inactive_3mo
    no_device
      .where("last_sign_in_at < ?", INACTIVE_NO_DEVICE.ago)
  end

  def inactive_11mo
    ok_device
      .where("last_sign_in_at < ?", INACTIVE_WITH_DEVICE.ago)
  end

  # Returns a Map. Key is the number of warnings sent, value is a User object
  # (not a device, but device is preloaded)
  def all_inactive
    @all_inactive ||= inactive_11mo.or(inactive_3mo).order(ORDER).limit(LIMIT)
  end

  def notify_old_accounts
    all_inactive
      .where(inactivity_warning_sent_at: nil)
      .map(&:send_inactivity_warning)
  end

  def delete_old_accounts
    all_inactive
      .where
      .not(inactivity_warning_sent_at: nil)
      .where("inactivity_warning_sent_at < ?", WARNING_TIME.ago)
      .map(&:deactivate_account)
  end

  # EDGE CASE: Accounts that register but never sign in.
  def cleanup_nils
    User
      .where(last_sign_in_at: nil)
      .limit(LIMIT)
      .map { |x| x.update!(last_sign_in_at: x.created_at) }
  end

  def perform
    cleanup_nils
    notify_old_accounts
    delete_old_accounts
  end
end
