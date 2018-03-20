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
      ActiveRecord::Base.transaction do
        # Possible nonsense ahead:
        #  Theory: In production today, we were doing some nonsense where we
        #          Store data in sequence.body and sequence.args, save it to the
        #          DB, pull it back out, convert it to a Hash
          sequence = Sequence.create!(inputs.merge(migrated_nodes: true))
          FirstPass.run!(sequence: sequence,
                         args: inputs[:args] || {},
                         body: inputs[:body] || [])
          CeleryScript::FetchCelery.run!(sequence: seq.reload) # Perf nightmare?
      end
    end
  end
end
