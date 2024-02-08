class AddSequenceLimitsToDevice < ActiveRecord::Migration[6.1]
  def up
    add_column :devices, :max_sequence_count, :integer, default: 0
    add_column :devices, :max_sequence_length, :integer, default: 0
  end

  def down
    remove_column :devices, :max_sequence_count
    remove_column :devices, :max_sequence_length
  end
end
