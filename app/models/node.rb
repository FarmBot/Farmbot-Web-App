# Support class for Fragment. Please see fragment.rb for documentation.
class Node < ApplicationRecord
  belongs_to :arg_set
  belongs_to :fragment
  belongs_to :kind

  belongs_to :body,   class_name: "Node"
  belongs_to :next,   class_name: "Node"
  belongs_to :parent, class_name: "Node"
end
