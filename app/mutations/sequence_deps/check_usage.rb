module SequenceDeps
  # Returns an array of sequence IDs (sequences that need the dependency).
  # an empty array indicates that the resource is not in use.
  class CheckUsers
    required do
      duck :resource , methods: [:id]
    end

    def execute
    end
  end
end
