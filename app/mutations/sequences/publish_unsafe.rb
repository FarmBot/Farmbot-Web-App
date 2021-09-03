module Sequences
  # This module allows publishing of shared sequences that
  # contain _any_ node. This circumvents the allow list
  # defined in Sequences::Publish.
  # Use this to publish sequences that were manually approved
  # by FarmBot staff.
  class PublishUnsafe < Sequences::Publish
    def enforce_allow_list
      false
    end
  end
end
