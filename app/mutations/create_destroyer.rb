# I heard you like mutations. So we made a mutation class that creates mutations
# so you can mutate while you mutate.
# This class will create a "base case" `::Delete` mutation. Very useful when you
# don't have special logic.
class CreateDestroyer < Mutations::Command
  BAD_OWNERSHIP = "You do not own that %s"

  required do
    duck   :resource
  end

  def execute
    symbolized_name = resource.model_name.singular
    klass           = resource

    Class.new(Mutations::Command) do
      @@resource_name = symbolized_name

      required do
        model :device,         class: Device
        model @@resource_name, class: klass
      end

      def validate
        not_yours unless self.send(@@resource_name).device == device
      end

      def execute
        self.send(@@resource_name).destroy! && ""
      end

      def not_yours
        add_error @@resource_name,
                  @@resource_name,
                  BAD_OWNERSHIP % @@resource_name
      end
    end
  end
end
