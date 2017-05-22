class EvolveToolSlotDeps < ActiveRecord::Migration[5.0]
  def change
    SequenceDependency.transaction do
      # ToolSlots are merged with points now.
      SequenceDependency
        .where(dependency_type: "ToolSlot")
        .map do |sd|
          sd.update_attributes!(dependency: sd.dependency.point)
        end
    end
  end
end
