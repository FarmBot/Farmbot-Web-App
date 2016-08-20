class RegimenItem < ActiveRecord::Base
  field :time_offset, type: Integer
  belongs_to :schedule
  belongs_to :regimen
  belongs_to :sequence
end
