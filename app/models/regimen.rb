
class Regimen
  include Mongoid::Document

  field :color, type: String, default: -> { Sequence::COLORS.sample }
  field :name

  has_many   :regimen_items
  belongs_to :device, dependent: :destroy

  validates_presence_of    :name
  validates_uniqueness_of  :name, scope: :device_id
  validates_inclusion_of   :color, in: Sequence::COLORS
end
