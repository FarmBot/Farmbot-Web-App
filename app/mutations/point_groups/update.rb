module PointGroups
  class Update < Mutations::Command
    include PointGroups::Helpers
    BLACKLISTED_FIELDS = [:device, :point_ids, :point_group]

    required do
      model :device, class: Device
      model :point_group, class: PointGroup
    end

    criteria

    optional do
      string :name
      array :point_ids, class: Integer
      array :group_type, class: String
      string :sort_type
    end

    def validate
      validate_point_ids if point_ids.present?
      validate_sort_type
    end

    def execute
      PointGroup.auto_sync_debounce do
        PointGroup.transaction do
          PointGroupItem.transaction do
            maybe_reconcile_points
            point_group.update!(update_attributes)
            point_group.reload # <= Because PointGroupItem caching?
          end
        end
      end
    end

    private

    def update_attributes
      @update_attributes ||= inputs
        .except(*BLACKLISTED_FIELDS)
        .merge(criteria: criteria || point_group.criteria)
    end

    def maybe_reconcile_points
      # Nil means "ignore"
      # []  means "reset"
      return if point_ids.nil?

      # STEP 0: Setup
      @old_point_ids = Set.new(point_group.point_group_items.pluck(:point_id))
      @new_point_ids = Set.new(point_ids)
      @dont_delete = @new_point_ids & @old_point_ids
      @do_delete = (@old_point_ids - @dont_delete).to_a

      # STEP 1: "Garbage Collection" of PGIs that are no longer used.
      PointGroupItem
        .where(point_group_id: point_group.id)
        .where(point_id: @do_delete)
        .destroy_all

      # STEP 2: Create missing PGIs
      @do_create = (@new_point_ids - @dont_delete)
      PointGroupItem.create!(@do_create.to_a.uniq.map do |point_id|
        { point_id: point_id, point_group_id: point_group.id }
      end)
    end
  end
end
