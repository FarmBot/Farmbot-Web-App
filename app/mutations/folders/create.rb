module Folders
  class Create < Mutations::Command
    required do
      model :device
      string :color
      string :name
      integer :parent_id
    end

    def execute
      Folder.create!(update_params)
    end

    private

    def update_params
      inputs.except(:parent_id).merge({ parent: parent })
    end

    def parent
      @parent ||= device.folders.find_by(id: parent_id)
    end
  end
end