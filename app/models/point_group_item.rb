class PointGroupItem < ApplicationRecord
  belongs_to :point_group
  belongs_to :point

  after_destroy :bump_point_group

  def broadcast?
    false
  end

  # PROBLEM:
  #  * You delete a point
  #  * ...causing a `PointGroup` deletion.
  #  * ...causing a change in the `point_id` value in `PointGroup`.
  #
  #  The method below manually updates the `updated_at` value of the point_group
  #  so that auto sync does not break.
  def bump_point_group
    point_group.update_attributes!(updated_at: Time.now)
  end
end
