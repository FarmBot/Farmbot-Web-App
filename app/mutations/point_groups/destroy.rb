module PointGroups
  class Destroy < Mutations::Command
    required do
      model :device, class: Device
      model :point_group, class: PointGroup
    end

    def validate
      # binding.pry
    end

    def execute
      point_group.destroy! && ""
    end

    private

    def in_use?
    end
  end
end
