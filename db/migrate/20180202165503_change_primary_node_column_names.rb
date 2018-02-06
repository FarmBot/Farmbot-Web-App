class ChangePrimaryNodeColumnNames < ActiveRecord::Migration[5.1]
  def change
    rename_column :primary_nodes, :body_id, :body_id
    add_reference :primary_nodes, :next, index: true
  end
end
