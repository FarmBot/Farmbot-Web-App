class AddLastSawMqToDevices < ActiveRecord::Migration[5.1]

  def change
    add_column :devices, :last_saw_mq, :datetime
  end
end
