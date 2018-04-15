# RESTful endpoint for knowing the web APIs public key. You will need this to
# Verify authenticity of JSON Web Tokens issued to you.
module Api
  class PublicKeysController < Api::AbstractController
    skip_before_action :authenticate_user!, only: :show
    skip_before_action :check_fbos_version, only: :show
    PUBLIC_KEY = KeyGen.current.public_key.to_pem

    # GET /api/public_key
    def show
      render plain: PUBLIC_KEY
    end
  end
end
