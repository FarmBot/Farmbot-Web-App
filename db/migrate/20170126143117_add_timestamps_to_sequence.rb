class AddTimestampsToSequence < ActiveRecord::Migration[5.0]
  def change
    add_column :sequences, :updated_at, :datetime
    add_column :sequences, :created_at, :datetime
    add_index  :sequences, :created_at
  end
end
