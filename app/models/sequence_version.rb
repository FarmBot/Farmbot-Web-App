# Support class for Fragment. Please see fragment.rb for documentation.
class SequenceVersion < ApplicationRecord
  belongs_to :sequence_publication
end
