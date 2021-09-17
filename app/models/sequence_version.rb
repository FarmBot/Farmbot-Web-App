# Support class for Fragment. Please see fragment.rb for documentation.
class SequenceVersion < ApplicationRecord
  belongs_to :sequence_publication
  has_one :fragment, as: :owner

  # We need a #device method on this resource
  # because Fragment::Create expects it.
  # it is OK to provide a `nil` device.
  def device; nil end

  def broadcast?
    false
  end

  def fragment_owner?
    true
  end
end
