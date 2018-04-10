# A single organism living in the ground.
class Plant < Point
  DEFAULT_ICON = "/app-resources/img/icons/generic-plant.svg"
  def do_migrate
    puts "MIGRATING TOOL SLOT #{self.id}"
    ToolSlot.transaction do
      legacy = LegacyToolSlot.find(pointer_id)
      self.update_attributes!(migrated_at:       Time.now,
                              tool_id:           legacy.tool_id,
                              pullout_direction: legacy.pullout_direction)
    end
  end
end
