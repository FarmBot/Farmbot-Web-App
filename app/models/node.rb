# Support class for Fragment. Please see fragment.rb for documentation.
class Node < ApplicationRecord
  belongs_to :fragment
  belongs_to :kind

  belongs_to :body,   class_name: "Node"
  belongs_to :next,   class_name: "Node"
  belongs_to :parent, class_name: "Node"

  has_one :arg_set, dependent: :destroy

  def self.destroy_all
    Node.transaction do
      # Self referential relations are weird...?
      Node.update_all(body_id: nil, next_id: nil, parent_id: nil)
      super
    end
  end
end

