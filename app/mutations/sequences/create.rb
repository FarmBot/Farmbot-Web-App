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
          hash :locals do
            optional do
              duck :*, methods: [:[], :[]=], default: {}
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
      # TODO: Delete this column in may '18 - RC
      seq.args["is_outdated"] = false
      # version is never user definable!
      # IF YOU REMOVE THIS BAD STUFF WILL HAPPEN:
      seq.args["version"]     = Sequence::LATEST_VERSION
      # See comment above ^
      ActiveRecord::Base.transaction do
        seq.migrated_nodes = true
        seq.save!
        CeleryScript::StoreCelery.run!(sequence: seq)
      end
      CeleryScript::FetchCelery.run!(sequence: seq.reload) # Perf nightmare?
    end
  end
end
