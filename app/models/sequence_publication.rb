# Support class for Fragment. Please see fragment.rb for documentation.
class SequencePublication < ApplicationRecord
  has_many :sequence_versions, dependent: :destroy

  def broadcast?
    false
  end
end
