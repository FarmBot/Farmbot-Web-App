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
               sequence_versions: available_version_ids || [],
               sequence_version_id: sequence.sequence_version_id,
             }
    end

    required do
      model :sequence, class: Sequence
    end

    def execute
      sv_id = sequence.sequence_version_id
      if !sequence.forked && sv_id
        celery = Fragments::Show.run!(owner: SequenceVersion.find(sv_id))
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

    def available_version_ids
      svid = sequence.sequence_version_id
      if svid
        SequenceVersion
          .find(svid)
          .sequence_publication
          .sequence_versions
          .pluck(:id)
      end
    end
  end
end
