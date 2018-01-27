class EdgeNode < ApplicationRecord
  belongs_to :sequence
  belongs_to :primary_node
  serialize  :value, JSON
end