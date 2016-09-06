class RegimenItem < ActiveRecord::Base
  belongs_to :regimen
  belongs_to :sequence
  validates_presence_of :sequence
end
