module Folders
  class Update < Mutations::Command
    required do
      model :device
      model :folder
      integer :parent_id, nils: true, empty_is_nil: true
    end

    optional do
      string :name
      string :color
    end

    def execute
      folder.update!(update_params) && folder
    end

    private

    def update_params
      inputs.except(:device, :folder).merge({ parent: parent })
    end

    def parent
      @parent ||= device.folders.find_by(parent_id)
    end
  end
end
