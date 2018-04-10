# A single organism living in the ground.
class Plant < Point
  DEFAULT_ICON = "/app-resources/img/icons/generic-plant.svg"
  def do_migrate
    puts "MIGRATING PLANT #{self.id}"
    Plant.transaction do
      legacy = LegacyPlant.find(self[:pointer_id])
      self.update_attributes!(migrated_at:   Time.now,
                              openfarm_slug: legacy.openfarm_slug,
                              plant_stage:   legacy.plant_stage,
                              pointer_type:  "Plant")
    end
  end
end
