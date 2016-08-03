class Regimen
  include Mongoid::Document
  field :color, in: Sequence::COLORS
  field :name
  embeds_many :regimen_items
end
