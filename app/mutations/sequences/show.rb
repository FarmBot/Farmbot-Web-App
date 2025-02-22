require_relative "../../lib/celery_script/cs_heap"

# Service object that:
# 1. Pulls out all PrimaryNodes and EdgeNodes for a sequence node (AST Flat IR form)
# 2. Stitches the nodes back together in their "canonical" (nested) AST
#    representation
# THIS IS BASICALLY A SERIALIZER FOR COMPLEX DATA THAT RAILS CAN'T HANDLE BY
# DEFAULT.
module Sequences
  class Show < Mutations::Command
    NO_SEQUENCE = "You must have a root node `sequence` at a minimum."

    # Generates a hash that has all the other fields that API users expect,
    # Eg: color, id, etc.
    def misc_fields
      return {
               id: sequence.id,
               created_at: sequence.created_at,
               updated_at: sequence.updated_at,
               args: Sequence::DEFAULT_ARGS,
               color: sequence.color,
               folder_id: sequence.folder_id,
               forked: is_owner? ? false : sequence.forked,
               name: sequence.name,
               pinned: sequence.pinned,
               copyright: copyright,
               description: description,
               sequence_versions: available_version_ids,
               # This is the parent sequence that this sequence was forked from.
               sequence_version_id: is_owner? ? nil : sequence_version_id,
             }
    end

    required do
      model :sequence, class: Sequence
    end

    def execute
      if use_upstream_version?
        celery = Fragments::Show.run!(owner: sequence_version)
      else
        celery = LegacyRenderer.new(sequence).run
      end
      canonical_form = misc_fields.merge!(celery)
      s = canonical_form.with_indifferent_access
      # HISTORICAL NOTE:
      #   When I prototyped the variables declaration stuff, a few (failed)
      #   iterations snuck into the DB. Gradually migrating is easier than
      #   running a full blow table wide migration.
      # - RC 3-April-18
      has_scope = s.dig(:args, :locals, :kind) == "scope_declaration"
      s[:args][:locals] = Sequence::SCOPE_DECLARATION unless has_scope

      return s
    end

    def sequence_version_id
      sequence.sequence_version_id
    end

    def copyright
      sequence.copyright || sequence_version&.copyright
    end

    def sequence_publication
      # Cache the association if it's already loaded
      return @sequence_publication if defined?(@sequence_publication)
      @sequence_publication = sequence.association(:sequence_publication).loaded? ? 
        sequence.sequence_publication : 
        SequencePublication.find_by(author_sequence_id: sequence.id)
    end

    def description
      sequence.description || sequence_version&.description
    end

    def sequence_version
      # Cache the association if it's already loaded
      return @sequence_version if defined?(@sequence_version)
      @sequence_version = sequence.association(:sequence_version).loaded? ? 
        sequence.sequence_version :
        SequenceVersion.find_by(id: sequence_version_id)
    end

    def use_upstream_version?
      !sequence.forked && sequence_version && sequence_version.id
    end

    def is_owner?
      !!sequence_publication&.published
    end

    # Heuristic for determining available sequence version.
    #
    def available_version_ids
      # First attempt:
      #   See if the this sequence "owns" is a published upstream publication.
      #   If it is not published, don't show anything to the author.
      #   If it IS published, show the versions to the author.
      if is_owner?
        return sequence_publication&.sequence_versions&.pluck(:id) || []
      end

      # Second attempt:
      # The consumer is not the author.
      # The sequence has an upstream sequence_version
      upstream_sp = sequence_version&.sequence_publication
      if upstream_sp&.published
        return upstream_sp.sequence_versions.pluck(:id)
      end

      # All other cases: Render nothing.
      return []
    end
  end
end
