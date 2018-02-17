# DRY up some of the repetitive route configs.
module Only
  CREATE               = [:create ]
  DESTROY              = [:destroy]
  INDEX                = [:index  ]
  SHOW                 = [:show   ]
  UPDATE               = [:update ]

  ALL                  = CREATE + DESTROY + INDEX + SHOW + UPDATE
  CREATE_SHOW          = CREATE + SHOW
  CREATE_UPDATE        = CREATE + UPDATE
  INDEX_AND_SHOW       = INDEX  + SHOW
  INDEX_CREATE_DESTROY = INDEX  + CREATE + DESTROY
  NON_INDEX            = ALL    - INDEX
  NON_INDEX_CREATE     = ALL    - INDEX  - CREATE
  NON_SHOW             = ALL    - SHOW
  NON_UPDATE           = ALL    - UPDATE
end

FarmBot::Application.routes.draw do

  resources :sensors
  namespace :api, defaults: {format: :json}, constraints: { format: "json" } do
    # Standard API Resources:
    {
      corpuses:         Only::INDEX_AND_SHOW,
      farm_events:      Only::NON_SHOW,
      images:           Only::NON_UPDATE,
      logs:             Only::INDEX_CREATE_DESTROY,
      password_resets:  Only::CREATE_UPDATE,
      peripherals:      Only::NON_SHOW,
      regimens:         Only::NON_SHOW,
      sensor_readings:  Only::NON_UPDATE,
      sequences:        Only::ALL,
      tools:            Only::ALL,
      webcam_feeds:     Only::ALL,
    }.to_a.map{|(name, only)| resources name, only: only}

    # Singular API Resources:
    {
      device:          Only::NON_INDEX,
      fbos_config:     Only::NON_INDEX_CREATE,
      firmware_config: Only::NON_INDEX_CREATE,
      public_key:      Only::SHOW,
      tokens:          Only::CREATE_SHOW,
      web_app_config:  Only::NON_INDEX_CREATE
    }.to_a.map{|(name, only)| resource name, only: only}

    resources :points, only: Only::ALL do
      post :search, on: :collection
    end
    resource :users,   only: Only::NON_INDEX do
      post :resend_verification, on: :member
    end

    # Make life easier on API users by not adding special rules for singular
    # resources.
    # Might be safe to remove now with the advent of TaggedResource.kind
    get   "/device/:id"          => "devices#show",            as: :get_device_redirect
    get   "/export_data"         => "devices#dump",            as: :dump_device
    get   "/storage_auth"        => "api/images#storage_auth", as: :storage_auth
    patch "/device/:id"          => "devices#update",          as: :patch_device_redirect
    patch "/users/:id"           => "users#update",            as: :patch_users_redirect
    patch "/webcam_feed/:id"     => "webcam_feeds#update",     as: :patch_webcam_feed_redirect
    put   "/device/:id"          => "devices#update",          as: :put_device_redirect
    put   "/password_resets"     => "password_resets#update",  as: :whatever
    put   "/users/:id"           => "users#update",            as: :put_users_redirect
    put   "/users/verify/:token" => "users#verify",            as: :users_verify
    put   "/webcam_feed/:id"     => "webcam_feeds#update",     as: :put_webcam_feed_redirect
  end

  devise_for :users

  # =======================================================================
  # NON-API (USER FACING) URLS:
  # =======================================================================
  get  "/"             => "dashboard#front_page",   as: :front_page
  get  "/app"          => "dashboard#main_app",     as: :dashboard
  get  "/tos_update"   => "dashboard#tos_update",   as: :tos_update
  post "/csp_reports"  => "dashboard#csp_reports",  as: :csp_report

  get "/password_reset/*token" => "dashboard#password_reset", as: :password_reset
  get "/verify" => "dashboard#verify", as: :verify

  match "/app/*path", to: "dashboard#main_app", via: :all, constraints: { format: "html" }
end
