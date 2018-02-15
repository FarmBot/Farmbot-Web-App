FarmBot::Application.routes.draw do

  namespace :api, defaults: {format: :json}, constraints: { format: "json" } do
    resources :images,          only: [:create, :destroy, :show, :index]
    resources :sensor_readings, only: [:create, :destroy, :show, :index]
    resources :regimens,        only: [:create, :destroy, :index, :update]
    resources :peripherals,     only: [:create, :destroy, :index, :update]
    resources :corpuses,        only: [:index, :show]
    resources :logs,            only: [:index, :create, :destroy]
    resources :sequences,       only: [:create, :update, :destroy, :index, :show]
    resources :farm_events,     only: [:create, :update, :destroy, :index]
    resources :tools,           only: [:create, :show, :index, :destroy, :update]
    resources :points,          only: [:create, :show, :index, :destroy, :update] do
        post :search, on: :collection
    end
    resource :public_key,     only: [:show]
    resource :tokens,         only: [:create, :show]
    resource :users,          only: [:create, :update, :destroy, :show] do
      post :resend_verification, on: :member
    end
    resource :device,         only: [:show, :destroy, :create, :update]
    resources :webcam_feeds,  only: [:create,
                                     :show,
                                     :index,
                                     :update,
                                     :destroy]
    resources :password_resets, only: [:create, :update]

    resource :web_app_config,  only: [:show, :destroy, :update]
    resource :fbos_config,     only: [:show, :destroy, :update]
    resource :firmware_config, only: [:show, :destroy, :update]

    put "/password_resets"     => "password_resets#update", as: :whatever
    put "/users/verify/:token" => "users#verify",           as: :users_verify
    # Make life easier on API users by not adding special rules for singular
    # resources.
    # Might be safe to remove now with the advent of TaggerResource.kind
    get   "/device/:id"  => "devices#show",   as: :get_device_redirect
    get   "/export_data" => "devices#dump",   as: :dump_device
    put   "/device/:id"  => "devices#update", as: :put_device_redirect
    patch "/device/:id"  => "devices#update", as: :patch_device_redirect
    put   "/users/:id"   => "users#update",   as: :put_users_redirect
    patch "/users/:id"   => "users#update",   as: :patch_users_redirect
    put   "/webcam_feed/:id"  => "webcam_feeds#update",
      as: :put_webcam_feed_redirect
    patch "/webcam_feed/:id"  => "webcam_feeds#update",
      as: :patch_webcam_feed_redirect

  end

  devise_for :users

  # Generate a signed URL for Google Cloud Storage uploads.
  get "/api/storage_auth" => "api/images#storage_auth", as: :storage_auth
  # You can set FORCE_SSL when you're done.

  # =======================================================================
  # NON-API (USER FACING) URLS:
  # =======================================================================
  get  "/"             => "dashboard#front_page",   as: :front_page
  get  "/app"          => "dashboard#main_app",     as: :dashboard
  get  "/tos_update"   => "dashboard#tos_update",   as: :tos_update
  post "/csp_reports"  => "dashboard#csp_reports",  as: :csp_report

  match "/app/*path",
          to: "dashboard#main_app",
          via: :all,
          constraints: { format: "html" }
  get "/password_reset/*token" => "dashboard#password_reset",
    as: :password_reset
  get "/verify" => "dashboard#verify", as: :verify
end
