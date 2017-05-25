class CreateLogDispatches < ActiveRecord::Migration[5.1]
  def change
    create_table :log_dispatches do |t|
      t.references :device, foreign_key: true
      t.references :log,    foreign_key: true
      t.datetime   :sent_at

      t.timestamps
    end

    add_index :log_dispatches, :sent_at
  end
end
