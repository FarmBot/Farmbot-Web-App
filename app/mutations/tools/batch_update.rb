module Tools
  class BatchUpdate < Mutations::Command
    class Fail < Exception; end;
    required do
      model :device, class: Device
      array :tools do
        hash do
          required do
            integer :id
          end

          optional do
            string  :name
          end
        end
      end
    end

    def execute
      Tool.transaction do
        tools.map { |p| update_tool(p) }
      end
    end

  private

    def update_tool(params)
      t = Tool.find(params.delete(:id))
      t.update_attributes!(params) && t
    end
  end
 end

