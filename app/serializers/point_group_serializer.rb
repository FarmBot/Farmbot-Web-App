class PointGroupSerializer < ApplicationSerializer
  attributes :name, :point_ids

  def point_ids
    puts "TODO: Ensure lazy loading takes place"
    object.point_group_items.pluck(:point_id)
  end
end
