class RegimenItem < ActiveRecord::Base
  belongs_to :regimen
  belongs_to :sequence
end
