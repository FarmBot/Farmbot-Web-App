class RegimenItem
  include Mongoid::Document
  field :offset, type: Integer
  has_one :schedule
end
