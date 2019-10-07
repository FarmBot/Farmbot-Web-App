class PointGroupItem < ApplicationRecord
  belongs_to :point_group
  belongs_to :point

  def broadcast?
    false
  end
end
