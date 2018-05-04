FarmBot::Application.routes.draw do
  namespace :api, defaults: {format: :json}, constraints: { format: "json" } do
    # Standard API Resources:
    {
      farm_events:            [:create, :destroy, :index, :update],
      farmware_installations: [:create, :destroy, :index],
      images:                 [:create, :destroy, :index, :show],
      password_resets:        [:create, :update],
      peripherals:            [:create, :destroy, :index, :update],
      sensors:                [:create, :destroy, :index, :update],
      regimens:               [:create, :destroy, :index, :update],
      sensor_readings:        [:create, :destroy, :index, :show],
      sequences:              [:create, :destroy, :index, :show, :update],
      tools:                  [:create, :destroy, :index, :show, :update],
      webcam_feeds:           [:create, :destroy, :index, :show, :update],
      device_configs:         [:create, :destroy, :index, :update],
      plant_templates:        [:create, :destroy, :index, :update],
      pin_bindings:           [:create, :destroy, :index, :show, :update]
    }.to_a.map { |(name, only)| resources name, only: only }

    # Singular API Resources:
    {
      device:          [:create, :destroy, :show, :update],
      fbos_config:     [:destroy, :show, :update,],
      firmware_config: [:destroy, :show, :update,],
      public_key:      [:show],
      tokens:          [:create, :show],
      web_app_config:  [:destroy, :show, :update],
    }.to_a.map{|(name, only)| resource name, only: only}
    get "/corpus" => "corpuses#show", as: :api_corpus

    resources(:points, except: []) { post :search, on: :collection }

    resources :logs, except: [:update, :show] do
      get :search, on: :collection
    end

    resource :users, except: [:index] do
      post :resend_verification, on: :member
      post :control_certificate, on: :collection
    end

    resources :saved_gardens, except: [ :show ] do
      post  :snapshot, on: :collection
      post  :apply,    on: :member
      patch :apply,    on: :member
    end

    get "/global_config" => "global_config#show", as: :global_config

    # Make life easier on API users by not adding special rules for singular
    # resources.
    # Might be safe to remove now with the advent of TaggedResource.kind
    get   "/device/:id"      => "devices#show",           as: :get_device_redirect
    post  "/export_data"     => "devices#dump",           as: :dump_device
    get   "/storage_auth"    => "images#storage_auth",    as: :storage_auth
    patch "/device/:id"      => "devices#update",         as: :patch_device_redirect
    patch "/users/:id"       => "users#update",           as: :patch_users_redirect
    patch "/webcam_feed/:id" => "webcam_feeds#update",    as: :patch_webcam_feed_redirect
    put   "/device/:id"      => "devices#update",         as: :put_device_redirect
    put   "/password_resets" => "password_resets#update", as: :whatever
    put   "/users/:id"       => "users#update",           as: :put_users_redirect
    put   "/webcam_feed/:id" => "webcam_feeds#update",    as: :put_webcam_feed_redirect
  end

  devise_for :users

  # =======================================================================
  # NON-API (USER FACING) URLS:
  # =======================================================================
  get  "/"             => "dashboard#front_page",   as: :front_page
  get  "/app"          => "dashboard#main_app",     as: :dashboard
  get  "/app/controls" => "dashboard#main_app",     as: :app_landing_page
  get  "/tos_update"   => "dashboard#tos_update",   as: :tos_update
  post "/csp_reports"  => "dashboard#csp_reports",  as: :csp_report

  get "/password_reset/*token" => "dashboard#password_reset", as: :password_reset
  get "/verify/:token"         => "dashboard#verify",         as: :verify_user

  match "/app/*path", to: "dashboard#main_app", via: :all, constraints: { format: "html" }
end
