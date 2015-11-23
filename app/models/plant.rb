# a single organism living in the
# ground (planting_area) that FarmBot watches over.
class Plant
  include Mongoid::Document

  belongs_to :device
  belongs_to :planting_area

  field :name, default: "Unknown Plant"
  field :x, type: Integer
  field :y, type: Integer
end
