class CreateLogs < ActiveRecord::Migration[5.0]
  def change
    create_table :logs do |t|
      t.text    :message
      t.text    :meta
      t.text    :channels
      t.integer :device_id
      t.timestamps
    end

    add_index :logs, :device_id
    add_column :devices, :max_log_count, :integer, default: 100
  end
end
