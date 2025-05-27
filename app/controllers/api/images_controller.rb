module Api
  # The API follows this workflow when creating a new image:
  # 1. Upload image to an S3 "untrusted" bucket (gets deleted quite often)
  # 2. POST the URL from step 1 (or any URL) to ImagesController#Create
  # 3. Image is transferred to the "trusted bucket".
  class ImagesController < Api::AbstractController
    cattr_accessor :store_locally

    def create
      mutate Images::Create.run(raw_json, device: current_device)
    end

    def index
      mutate Images::Fetch.run(device: current_device)
    end

    def show
      render json: image
    end

    def destroy
      Image.delay.maybe_destroy(image.id) # See notes. This is for edge cases.
      render json: ""
    end

    # Creates a "policy object" + meta data so that users may upload an image to
    # Google Cloud Storage.
    def storage_auth
      mutate policy_class.run
    end

    private

    def self.store_locally?
      !ENV["GCS_BUCKET"]
    end

    def policy_class
      if ImagesController.store_locally?
        Images::StubPolicy
      else
        Images::GeneratePolicy
      end
    end

    def image
      @image ||= Image.where(device: current_device).find(params[:id])
    end
  end
end
