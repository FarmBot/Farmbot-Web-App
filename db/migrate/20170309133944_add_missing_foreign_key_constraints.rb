class AddMissingForeignKeyConstraints < ActiveRecord::Migration[5.0]
  def change
    bad_tools = (ToolSlot.pluck(:tool_id) - Tool.pluck(:id)).compact.uniq.sort
    ToolSlot.where(tool_id: bad_tools).destroy_all
    add_foreign_key :tool_slots, :tools
  end
end
