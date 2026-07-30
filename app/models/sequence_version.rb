# Support class for Fragment. Please see fragment.rb for documentation.
class SequenceVersion < ApplicationRecord
  belongs_to :sequence_publication
  has_one :fragment, as: :owner

  scope :publicly_available, lambda {
    joins(:sequence_publication)
      .where(sequence_versions: { withdrawn_at: nil })
      .where(sequence_publications: { published: true })
  }

  # We need a #device method on this resource
  # because Fragment::Create expects it.
  # it is OK to provide a `nil` device.
  def device; nil end

  def publicly_available?
    withdrawn_at.nil? && sequence_publication.published?
  end

  def broadcast?
    false
  end

  def fragment_owner?
    true
  end
end
