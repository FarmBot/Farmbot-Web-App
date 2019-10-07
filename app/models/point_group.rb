class PointGroup < ApplicationRecord
  SORT_TYPES =
    %w(xy_ascending xy_descending yx_ascending yx_descending random).sort
  BAD_SORT = "%{value} is not valid. Valid options are: " +
             SORT_TYPES.map(&:inspect).join(", ")
  DONT_BROADCAST = ApplicationRecord::DONT_BROADCAST.without("updated_at")

  belongs_to :device
  has_many :point_group_items, dependent: :destroy
  validates_inclusion_of :sort_type, in: SORT_TYPES,
                                     message: BAD_SORT
end
