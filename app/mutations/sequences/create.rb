module Sequences
  class Create < Mutations::Command
    include CeleryScriptValidators

    required do
      model  :device, class: Device
      string :name
      duck   :body, methods: [:[], :[]=, :each, :map]
    end

    optional do
      string :color, in: Sequence::COLORS
      hash :args do
        optional do
          optional do
            hash :locals do
              optional do
                duck :*, methods: [:[], :[]=], default: {}
              end
            end
          end
        end
      end
    end

    def validate
      validate_sequence
    end

    def execute
      seq = Sequence.new(inputs)
      seq.args["is_outdated"] = false
      # version is never user definable!
      # IF YOU REMOVE THIS BAD STUFF WILL HAPPEN:
      seq.args["version"]     = SequenceMigration::Base.latest_version
      # See comment above ^
      ActiveRecord::Base.transaction do
        seq.save!
        reload_dependencies(seq)
      end
      seq
    end
  end
end
