class ChangePrimaryNodeColumnNames < ActiveRecord::Migration[5.1]

  def change
    add_reference :primary_nodes, :next, index: true
    add_reference :primary_nodes, :body, index: true
  end
end
