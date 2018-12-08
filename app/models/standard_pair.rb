# Support class for Fragment. Please see fragment.rb for documentation.
class StandardPair < ApplicationRecord
  belongs_to :fragment
  belongs_to :arg_set
  belongs_to :arg_name
  belongs_to :node
end
