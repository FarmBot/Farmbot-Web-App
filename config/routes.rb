FarmBot::Application.routes.draw do
  namespace :api, defaults: { format: :json }, constraints: { format: "json" } do
    post "/rmq/user" => "rmq_utils#user_action", as: "rmq_user"
    post "/rmq/vhost" => "rmq_utils#vhost_action", as: "rmq_vhost"
    post "/rmq/resource" => "rmq_utils#resource_action", as: "rmq_resource"
    post "/rmq/topic" => "rmq_utils#topic_action", as: "rmq_topic"

    # Standard API Resources:
    {
      diagnostic_dumps: [:create, :destroy, :index],
      alerts: [:create, :destroy, :index],
      farm_events: [:create, :destroy, :index, :show, :update],
      farmware_envs: [:create, :destroy, :index, :show, :update],
      global_bulletins: [:show],
      images: [:create, :destroy, :index, :show],
      password_resets: [:create, :update],
      peripherals: [:create, :destroy, :index, :show, :update],
      pin_bindings: [:create, :destroy, :index, :show, :update],
      plant_templates: [:create, :destroy, :index, :update],
      regimens: [:create, :destroy, :index, :show, :update],
      sensor_readings: [:create, :destroy, :index, :show],
      sensors: [:create, :destroy, :index, :show, :update],
      sequences: [:create, :destroy, :index, :show, :update],
      tools: [:create, :destroy, :index, :show, :update],
      webcam_feeds: [:create, :destroy, :index, :show, :update],
    }.to_a.map { |(name, only)| resources name, only: only }

    # Singular API Resources:
    {
      device_cert: [:create],
      device: [:create, :destroy, :show, :update],
      fbos_config: [:destroy, :show, :update],
      firmware_config: [:destroy, :show, :update],
      public_key: [:show],
      tokens: [:create, :show],
      web_app_config: [:destroy, :show, :update],
    }.to_a.map { |(name, only)| resource name, only: only }
    get "/corpus" => "corpuses#show", as: :api_corpus

    resources(:points, except: []) { post :search, on: :collection }

    resources :farmware_installations, except: [:update] do
      post :refresh, on: :member
    end

    resources :logs, except: [:update, :show] do
      # When farmware fetching fails and the user
      # wants to try again.
      get :search, on: :collection
    end

    resource :users, except: [:index] do
      post :resend_verification, on: :member
      post :control_certificate, on: :collection
    end

    resources :saved_gardens, except: [:show] do
      post :snapshot, on: :collection
      post :apply, on: :member
      patch :apply, on: :member
    end

    get "/global_config" => "global_config#show", as: :global_config
    get "/device/sync" => "devices#sync", as: :device_sync
    post "/device/seed" => "devices#seed", as: :device_seed
    post "/device/reset" => "devices#reset", as: :device_reset

    # Make life easier on API users by not adding special rules for singular
    # resources.
    # Might be safe to remove now with the advent of TaggedResource.kind
    get "/device/:id" => "devices#show", as: :get_device_redirect
    patch "/device/:id" => "devices#update", as: :patch_device_redirect
    put "/device/:id" => "devices#update", as: :put_device_redirect

    delete "/fbos_config/:id" => "fbos_configs#destroy", as: "delete_fbos_config_redirect"
    get "/fbos_config/:id" => "fbos_configs#show", as: "get_fbos_config_redirect"
    put "/fbos_config/:id" => "fbos_configs#update", as: "put_fbos_config_redirect"

    delete "/firmware_config/:id" => "firmware_configs#destroy", as: "delete_firmware_config_redirect"
    get "/firmware_config/:id" => "firmware_configs#show", as: "get_firmware_config_redirect"
    patch "/firmware_config/:id" => "firmware_configs#update", as: "patch_firmware_config_redirect"
    put "/firmware_config/:id" => "firmware_configs#update", as: "put_firmware_config_redirect"

    delete "/web_app_config/:id" => "web_app_configs#destroy", as: "delete_web_app_config_redirect"
    get "/web_app_config/:id" => "web_app_configs#show", as: "get_web_app_config_redirect"
    patch "/web_app_config/:id" => "web_app_configs#update", as: "patch_web_app_config_redirect"
    put "/web_app_config/:id" => "web_app_configs#update", as: "put_web_app_config_redirect"

    patch "/users/:id" => "users#update", as: :patch_users_redirect
    put "/users/:id" => "users#update", as: :put_users_redirect

    patch "/webcam_feed/:id" => "webcam_feeds#update", as: :patch_webcam_feed_redirect
    put "/webcam_feed/:id" => "webcam_feeds#update", as: :put_webcam_feed_redirect

    put "/password_resets" => "password_resets#update", as: :whatever
    get "/storage_auth" => "images#storage_auth", as: :storage_auth
    post "/export_data" => "devices#dump", as: :dump_device
  end

  devise_for :users

  # =======================================================================
  # NON-API (USER FACING) URLS:
  # =======================================================================
  get "/" => "dashboard#front_page", as: :front_page

  get "/app" => "dashboard#main_app", as: :dashboard
  get "/app/controls" => "dashboard#main_app", as: :app_landing_page
  match "/app/*path", to: "dashboard#main_app", via: :all, constraints: { format: "html" }

  get "/tos_update" => "dashboard#tos_update", as: :tos_update
  get "/password_reset/*token" => "dashboard#password_reset", as: :password_reset
  get "/verify/:token" => "dashboard#confirmation_page", as: :confirmation_page
  post "/csp_reports" => "dashboard#csp_reports", as: :csp_report
  post "/direct_upload" => "dashboard#direct_upload", as: :direct_upload
end
