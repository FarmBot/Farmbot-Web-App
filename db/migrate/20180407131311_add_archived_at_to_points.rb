class AddArchivedAtToPoints < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    add_column :points, :archived_at,       :datetime,  default: nil
    add_column :points, :planted_at,        :datetime,  default: nil
    add_column :points, :openfarm_slug,     :string,    limit: 280, default: "50", null: false
    add_column :points, :plant_stage,       :string,    limit: 10,  default: "planned"
    add_column :points, :tool_id,           :integer
    add_column :points, :pullout_direction, :integer,   default: 0
  end
end
