module Resources
  class Job < Mutations::Command
    required do
      duck    :body, methods: [:[], :[]=]
      duck    :resource, duck: [:where, :find_by]
      integer :resource_id
      model   :device, class: Device
      string  :action, in: ACTIONS
      string  :uuid
    end

    def validate
      # Should never trigger in production.
      never unless RESOURCES.values.include?(resource) # Security critical
    end

    def execute
      case action
      when DESTROY then do_deletion
      else; never
      end
    end

    private

    def plural_resource
      @plural_resource ||= resource.name.pluralize
    end

    def do_deletion
      model_name = resource.model_name
      mutation   = Kernel.const_get(model_name.name.pluralize)::Destroy
      mutation.run!(model_name.singular => model, device: device)
    end

    def model
      @model ||= device.send(plural_resource.tableize).find(resource_id)
    end

    # Escape hatch for things that should "never happen".
    def never
      raise "PANIC: Tried to do batch op on #{resource}"
    end
  end # Job
end # Resources
