module Folders
  class Create < Mutations::Command
    required do
      model :device
      string :color
      string :name
    end

    optional do
      integer :parent_id
    end

    def validate
      validate_parent_id
    end

    def execute
      Folder.create!(update_params)
    end

    private

    def update_params
      { parent: parent }.merge(inputs.except(:parent_id))
    end

    def parent
      @parent ||= device.folders.find_by(id: parent_id)
    end

    def validate_parent_id
      unless parent
        add_error :folder_id, :folder_id_invalid, "Folder ID is not valid"
      end
    end
  end
end