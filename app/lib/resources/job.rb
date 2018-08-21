module Resources
  class Job < Mutations::Command
    NOT_FOUND     = "Resource not found"
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
      when SAVE    then do_save
      else; never
      end
    rescue ActiveRecord::RecordNotFound
      add_error :not_found, :not_found, NOT_FOUND
    end

    private

    def plural_resource
      @plural_resource ||= resource.name.pluralize
    end

    def do_save
      model_name    = resource.model_name
      device_params = inputs.slice(:device)
      klass         = Kernel.const_get(model_name.name.pluralize)
      if resource_id > 0
        model        = resource.where(device_params).find(resource_id)
        model_params = {model_name.singular => model}
        # device_params is ALWAYS last because security.
        klass::Update.run!(body, model_params, device_params) # Security!
      else
        klass::Create.run!(body, device_params)
      end
    end

    def do_deletion
      model_name = resource.model_name
      mutation   = Kernel.const_get(model_name.name.pluralize)::Destroy
      mutation.run!(model_name.singular => model, device: device)
    rescue ActiveRecord::RecordNotFound
      add_error :resource, :resource, NOT_FOUND
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
