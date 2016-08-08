class RegimenItem
  include Mongoid::Document
  field :offset, type: Integer
  belongs_to :schedule
  belongs_to :regimen, class_name: "Regimen"#, inverse_of: "regimen_items"
  belongs_to :sequence
end
