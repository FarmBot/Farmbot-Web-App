# I heard you like mutations. So we made a mutation class that creates mutations
# so you can mutate while you mutate.
# This class will create a "base case" `::Delete` mutation. Very useful when you
# don't have special logic.
class CreateDestroyer < Mutations::Command
  BAD_OWNERSHIP = "You do not own that %s"

  required { duck :resource }

  def execute
    klass = Class.new(Mutations::Command)

    klass.instance_variable_set("@resource", resource)

    klass.class_eval do |x|
      def self.resource
        @resource
      end

      def self.resource_name
        resource.model_name.singular
      end

      def resource_name
        self.class.resource_name
      end

      required do
        model :device,                    class: Device
        model klass.resource_name.to_sym, class: x.resource
      end

      def validate
        not_yours unless self.send(resource_name).device == device
      end

      def execute
        self.send(resource_name).destroy! && ""
      end

      def not_yours
        add_error resource_name, resource_name, BAD_OWNERSHIP % resource_name
      end
    end

    return klass
  end
end
