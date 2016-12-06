class RegimenItem < ActiveRecord::Base
  belongs_to :regimen
  belongs_to :sequence
  validates :sequence, presence: true
end
