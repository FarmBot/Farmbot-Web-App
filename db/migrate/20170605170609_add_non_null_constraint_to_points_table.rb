class AddNonNullConstraintToPointsTable < ActiveRecord::Migration[5.1]
  def change
    Point.where(pointer_type: nil).destroy_all
    Point.where(pointer_id: nil).destroy_all
    change_column :points, :pointer_type, :string, null: false
    change_column :points, :pointer_id, :integer, null: false
  end
end
