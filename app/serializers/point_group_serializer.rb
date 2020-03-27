class PointGroupSerializer < ApplicationSerializer
  attributes :name, :point_ids, :sort_type, :group_type, :criteria

  def point_ids
    object.point_group_items.pluck(:point_id)
  end

  def criteria
    object.criteria || PointGroup::DEFAULT_CRITERIA
  end

  def group_type
    object.group_type || []
  end
end
