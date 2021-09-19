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
               forked: sequence.forked,
               name: sequence.name,
               pinned: sequence.pinned,
               copyright: copyright,
               sequence_versions: available_version_ids,
               # This is the parent sequence that this sequence was forked from.
               sequence_version_id: sequence.sequence_version_id,
             }
    end

    required do
      model :sequence, class: Sequence
    end

    def execute
      if is_forked?
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

    def sequence_version
      @sequence_version ||= SequenceVersion.find_by(id: sequence.sequence_version_id)
    end

    def is_forked?
      !sequence.forked && sequence_version && sequence_version.id
    end

    def copyright
      sequence_version&.copyright || ""
    end

    def available_version_ids
      results = []

      if sequence_version
        their_sp = sequence_version.sequence_publication
        if their_sp.published
          results.push(*their_sp.sequence_versions.pluck(:id))
        end
      end

      sp = SequencePublication.find_by(author_sequence_id: sequence.id,
                                       published: true)
      if sp
        results.push(*sp.sequence_versions.pluck(:id))
      end

      return results
    end
  end
end
