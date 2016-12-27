module Tools
  class Destroy < Mutations::Command
    STILL_IN_USE = "Can't delete tool because the following sequences are "\
                   "still using it: %s"
    required do
      model :tool, class: Tool
    end

    def validate
      deps = SequenceDependency.where(dependency: tool)
      if deps.any?
        names = deps.map(&:sequence).map(&:name).join(", ")
        m = STILL_IN_USE % [names]
        add_error :tool, :in_use, m
      end
    end

    def execute
      tool.destroy!
    end
  end
end
