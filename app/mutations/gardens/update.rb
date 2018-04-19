module SavedGardens
  class Update < Mutations::Command
    required do
      model :saved_garden, class: SavedGarden
    end

    optional do
      string :name
    end

    def execute
      saved_garden.update_attributes!(inputs.except(:saved_garden))
      saved_garden
    end
  end
end
