class Regimen
  include Mongoid::Document
  field :color #, in: Sequence::COLORS
  field :name
  has_many :regimen_items
  belongs_to :device, dependent: :destroy
end

