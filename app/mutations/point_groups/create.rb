module PointGroups
  class Create < Mutations::Command
    include PointGroups::Helpers

    required do
      model :device, class: Device
      string :name
      array :point_ids, class: Integer
    end

    def validate
      validate_point_ids
    end

    def execute
      PointGroup.transaction do
        PointGroupItem.transaction do
          pg = PointGroup.new(name: name, device: device)
          point_ids.uniq.map do |id|
            pg.point_group_items << PointGroupItem.new(point_id: id)
          end
          pg.save!
          pg
        end
      end
    end
  end
end
