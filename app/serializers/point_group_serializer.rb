class PointGroupSerializer < ApplicationSerializer
  attributes :name, :point_ids, :sort_type, :criteria

  def point_ids
    object.point_group_items.pluck(:point_id)
  end

  def criteria
    # Older records can contain both symbol and string keys for the same field.
    (object.criteria || PointGroup::DEFAULT_CRITERIA).deep_symbolize_keys
  end
end
