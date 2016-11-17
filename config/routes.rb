FarmBot::Application.routes.draw do

  namespace :api, defaults: {format: :json} do
    resource :sync, only: [:show]
    resource :public_key, only: [:show]
    resource :tokens, only: [:create]
    resource :users, only: [:create, :update, :destroy]
    resource :device, only: [:show, :destroy, :create, :update]
    resources :plants, only: [:create, :destroy, :index]
    resources :regimens, only: [:create, :destroy, :index, :update]
    resources :planting_area, only: [:create, :destroy]
    resources :sequences, only: [:create, :update, :destroy, :index, :show]
    resources :schedules, only: [:create, :update, :destroy, :index]
    resources :peripherals, only: [:create, :destroy, :index]
    resources :corpuses, only: [:index, :show]
  end

  devise_for :users

  # You can set FORCE_SSL when you're done.  
  get "/.well-known/acme-challenge/:id" => "dashboard#lets_encrypt", as: :lets_encrypt
  # Hacks for HTML5 push state routing:
  get "/app"                            => 'dashboard#index', as: :dashboard
  match "/app/*path", to: 'dashboard#index', via: :all # Loads /app/index.html
end
