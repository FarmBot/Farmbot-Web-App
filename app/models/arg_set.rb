# Support class for Fragment. Please see fragment.rb for documentation.
class ArgSet < ApplicationRecord
  belongs_to :fragment
  belongs_to :node
end
