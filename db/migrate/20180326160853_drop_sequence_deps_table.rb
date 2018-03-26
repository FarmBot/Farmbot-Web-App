class DropSequenceDepsTable < ActiveRecord::Migration[5.1]
  def change
    # NOTE TO FUTURE SELF:
    #   if data issues prevent this migration from running try
    #   https://stackoverflow.com/a/13299109/1064917
    drop_table :sequence_dependencies do |t|
      t.string  :dependency_type
      t.integer :dependency_id
      t.integer :sequence_id
    end
  end
end
