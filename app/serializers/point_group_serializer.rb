class PointGroupSerializer < ApplicationSerializer
  attributes :name, :point_ids

  def point_ids
    if object.association_cached?(:point_group_items)
      object.point_group_items.pluck(:point_id)
    else
      raise "N+1 Detected in PointGroupSerializer"
    end
  end
end
