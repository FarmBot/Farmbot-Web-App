module SequenceMigration
  # Background: This is a cleanup of legacy naming conventions.
  # that was hanging around:
  # * sub_sequence_id => sequence_id
  # * data_label      => label
  class CleanupArgNames < Base
    VERSION    = 4
    CREATED_ON = "January 5 2017"

    def up
      replacement = sequence.traverse do |node|
        args = node[:args]
        rename_sub_sequence_id(args)
        rename_data_label(args)
      end
      sequence.body = replacement[:body].map(&:deep_stringify_keys)
      sequence.args = replacement[:args].deep_stringify_keys
    end

    def rename_sub_sequence_id(args)
      if args.has_key?(:sub_sequence_id)
        args[:sequence_id] = args.delete(:sub_sequence_id)
      end
    end

    def rename_data_label(args)
      if args.has_key?(:data_label)
        args[:label] = args.delete(:data_label)
      end
    end
  end
end
