class PointGroup < ApplicationRecord
  belongs_to :device
  has_many :point_group_items, dependent: :destroy
end
