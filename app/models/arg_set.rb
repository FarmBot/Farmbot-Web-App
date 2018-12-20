# Support class for Fragment. Please see fragment.rb for documentation.
class ArgSet < ApplicationRecord
  belongs_to :fragment
  belongs_to :node
  has_many   :primitive_pairs, dependent: :destroy
  has_many   :standard_pairs,  dependent: :destroy

  def broadcast?
    false
  end
end
