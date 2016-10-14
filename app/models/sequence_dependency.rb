class SequenceDependency < ActiveRecord::Base
  belongs_to :sequence
  belongs_to :dependency, polymorphic: true
end
