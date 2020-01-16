class PointGroup < ApplicationRecord
  SORT_TYPES =
    %w(xy_ascending xy_descending yx_ascending yx_descending random).sort
  BAD_SORT = "%{value} is not valid. Valid options are: " +
             SORT_TYPES.map(&:inspect).join(", ")
  DEFAULT_CRITERIA = {
    day: { op: "<", days: 0 },
    string_eq: {},
    number_eq: {},
    number_lt: {},
    number_gt: {},
  }

  belongs_to :device
  has_many :point_group_items, dependent: :destroy
  validates_inclusion_of :sort_type, in: SORT_TYPES,
                                     message: BAD_SORT
  serialize :criteria
end
