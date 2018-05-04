module Api
  # The API follows this workflow when creating a new image:
  # 1. Upload image to an S3 "untrusted" bucket (gets deleted quite often)
  # 2. POST the URL from step 1 (or any URL) to ImagesController#Create
  # 3. Image is transfered to the "trusted bucket".
  class ImagesController < Api::AbstractController
    cattr_accessor :store_locally
    self.store_locally = !ENV["GCS_BUCKET"]

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
      image.delay.destroy!
      render json: ""
    end

    # Creates a "policy object" + meta data so that users may upload an image to
    # Google Cloud Storage.
    def storage_auth
      mutate policy_class.run
    end

    # (for self hosted users) Direct image upload endpoint.
    # Do not use this if you use GCS- it will slow your app down.
    def direct_upload
      raise "BOOM!"
    end

  private
    def policy_class
      if ImagesController.store_locally
        Images::GeneratePolicy
      else
        Images::StubPolicy
      end
    end

    def image
      @image ||= Image.where(device: current_device).find(params[:id])
    end
  end
end
