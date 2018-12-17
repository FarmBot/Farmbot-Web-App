# Support class for Fragment. Please see fragment.rb for documentation.
class Node < ApplicationRecord
  EVERYTHING = \
    { arg_set: {standard_pairs: {}, primitive_pairs: {}}, kind: {} }

  belongs_to :fragment
  belongs_to :kind

  belongs_to :body,   class_name: "Node", required: true
  belongs_to :next,   class_name: "Node", required: true
  belongs_to :parent, class_name: "Node", required: true

  has_one :arg_set, dependent: :destroy

  def self.destroy_all
    Node.transaction do
      # Self referential relations are weird...?
      Node.update_all(body_id: nil, next_id: nil, parent_id: nil)
      super
    end
  end
end
