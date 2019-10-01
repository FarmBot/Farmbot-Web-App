module PointGroups
  class Update < Mutations::Command
    include PointGroups::Helpers

    required do
      model :device, class: Device
      model :point_group, class: PointGroup
    end

    optional do
      string :name
      array :point_ids, class: Integer
      string :sort_type
    end

    def validate
      validate_point_ids if point_ids.any?
      validate_sort_type
    end

    def execute
      PointGroup.transaction do
        PointGroup.transaction do
          maybe_reconcile_points
          point_group.update_attributes!(update_attributes)
          point_group.reload
        end
      end
    end

    private

    def update_attributes
      @update_attributes ||= inputs
        .except(:device, :point_ids)
        .merge(updated_at: Time.now)
    end

    def maybe_reconcile_points
      # STEP 0: Setup
      @old_point_ids = Set.new(point_group.point_group_items.pluck(:id))
      @new_point_ids = Set.new(point_ids)
      @dont_delete = @new_point_ids & @old_point_ids
      @do_delete = (@old_point_ids - @dont_delete).to_a

      # STEP 1: "Garbage Collection" of PGIs that are no longer used.
      PointGroupItem.where(id: @do_delete).map(&:destroy!)

      # STEP 2: Create missing PGIs
      @do_create = (@new_point_ids - @dont_delete)
      PointGroupItem.create!(@do_create.to_a.uniq.map do |id|
        { point_id: id, point_group_id: point_group.id }
      end)
    end
  end
end
