# Support class for Fragment. Please see fragment.rb for documentation.
class StandardPair < ApplicationRecord
  belongs_to :fragment, autosave: true
  belongs_to :arg_set,  autosave: true
  belongs_to :arg_name, autosave: true
  belongs_to :node,     autosave: true
end
