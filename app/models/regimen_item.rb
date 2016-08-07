class RegimenItem
  include Mongoid::Document
  field :offset, type: Integer
  belongs_to :schedule
  belongs_to :sequence
end
