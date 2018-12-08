# Support class for Fragment. Please see fragment.rb for documentation.
class Primitive < ApplicationRecord
  belongs_to :fragment
  has_many :primitive_pairs # Maybe has_one, idk
end
