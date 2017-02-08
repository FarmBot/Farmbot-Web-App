module FarmEvents
  module ExecutableHelpers
    NO_EXECUTABLE = "You must provide a valid executable_id and "\
                    "executable_type for a Sequence or Regimen object."
    def self.included(base)
      base.extend(ClassMethods)
    end

    module ClassMethods
      # :required or :optional
      def executable_fields(optionality)
        self.send(optionality) do
          integer :executable_id
          string  :executable_type, in: FarmEvent::EXECUTABLE_CLASSES.map(&:name)
        end
      end
    end

    def validate_executable
        add_error :executable, :not_found, NO_EXECUTABLE unless executable
    end

    def executable
      @executable ||= klass.where(id: executable_id).first
    end

    def klass
      ({"Sequence" => Sequence, "Regimen"  => Regimen })[executable_type]
    end
  end
end