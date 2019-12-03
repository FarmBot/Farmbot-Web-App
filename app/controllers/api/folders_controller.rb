module Api
  class FoldersController < Api::AbstractController
    def create
      mutate Folders::Create.run(raw_json, device: current_device)
    end

    def index
      render json: folders
    end

    def show
      render json: folder
    end

    def update
      mutate Folders::Update.run(raw_json,
                                 folder: folder,
                                 device: current_device)
    end

    def destroy
      raise "Ensure no sequences are using this folder"
      render json: folder.destroy! && ""
    end

    private

    def folder
      folders.find(params[:id])
    end

    def folders
      current_device.folders
    end
  end
end
