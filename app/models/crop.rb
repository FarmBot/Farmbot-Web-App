#
class Crop
  include Mongoid::Document

  belongs_to :device

  field :x, type: Integer
  field :y, type: Integer
end
