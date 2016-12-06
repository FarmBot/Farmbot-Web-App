class FlipFlopToolsRelation < ActiveRecord::Migration[5.0]
  def change
    remove_column :tools,      :tool_slot_id, :integer
    add_column    :tool_slots, :tool_id,      :integer
    add_index     :tool_slots, :tool_id
  end
end
