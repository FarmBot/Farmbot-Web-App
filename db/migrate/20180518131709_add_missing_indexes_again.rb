class AddMissingIndexesAgain < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    add_index :points, [:id, :pointer_type]
  end
end
