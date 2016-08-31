class RegimenItem < ActiveRecord::Base
  belongs_to :schedule
  belongs_to :regimen
  belongs_to :sequence
end
