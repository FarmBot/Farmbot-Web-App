class GetRidOfLogDispatches < ActiveRecord::Migration[5.2]
  def change
    drop_table :log_dispatches do |t|
      t.bigint   :device_id
      t.bigint   :log_id
      t.datetime :sent_at
      t.datetime :created_at, null: false
      t.datetime :updated_at, null: false
    end
    # If we don't do this, a storm of emails will hit every user.
    # Relates to the deprecation of the `LogDispatch` table. - RC, 9 JUN 18
    Log.where("created_at < ?", 1.hour.ago).update_all(sent_at: 2.hours.ago)
  end
end
