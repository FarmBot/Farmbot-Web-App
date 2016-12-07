FarmBot::Application.routes.draw do

  namespace :api, defaults: {format: :json}, constraints: { format: 'json' } do
    resource :sync,             only: [:show]
    resource :public_key,       only: [:show]
    resource :tokens,           only: [:create]
    resource :users,            only: [:create, :update, :destroy]
    resource :device,           only: [:show, :destroy, :create, :update]
    resources :plants,          only: [:create, :destroy, :index]
    resources :password_resets, only: [:create, :update]
    resources :regimens,        only: [:create, :destroy, :index, :update]
    resources :planting_area,   only: [:create, :destroy]
    resources :peripherals,     only: [:create, :destroy, :index]
    resources :corpuses,        only: [:index, :show]
    resources :tool_bays,       only: [:show, :index, :update]
    resources :logs,            only: [:index, :create]    
    resources :sequences,       only: [:create, :update, :destroy,
                                       :index, :show]
    resources :schedules,       only: [:create, :update, :destroy,
                                       :index]
    resources :tool_slots,      only: [:create, :show, :index,
                                       :destroy, :update]
    resources :tools,           only: [:create, :show, :index,
                                       :destroy, :update]
    # TODO: Why does Rails hate JWTs as an ID?
    #       JWTs are supposed to be URL safe, I thought?
    #       This is a hack to get around 404 errors caused by
    #       PUTing a JWT to api/password_resets/MY_JWT_HERE
    put "/password_resets"     => "password_resets#update", as: :whatever
    put "/users/verify/:token" => "users#verfiy",           as: :users_verify
  end

  devise_for :users

  # You can set FORCE_SSL when you're done.  
  get "/.well-known/acme-challenge/:id" => "dashboard#lets_encrypt", as: :lets_encrypt
  # Hacks for HTML5 push state routing:
  get "/app"                            => 'dashboard#index', as: :dashboard
  match "/app/*path", to: 'dashboard#index', via: :all # Loads /app/index.html
end
