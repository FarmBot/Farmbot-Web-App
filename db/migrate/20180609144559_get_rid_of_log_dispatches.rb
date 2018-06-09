class GetRidOfLogDispatches < ActiveRecord::Migration[5.2]
  def change
    drop_table :log_dispatches do |t|
      t.bigint   :device_id
      t.bigint   :log_id
      t.datetime :sent_at
      t.datetime :created_at, null: false
      t.datetime :updated_at, null: false
    end
  end
end
