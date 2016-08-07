class Regimen
  include Mongoid::Document
  field :color #, in: Sequence::COLORS
  field :name
  has_many :items, class_name: "RegimenItem"
  belongs_to :device, dependent: :destroy
end

